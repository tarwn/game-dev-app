using Dapper;
using FluentAssertions;
using GDB.App.Controllers.General;
using GDB.App.Controllers.General.Models;
using GDB.Business.Authentication;
using GDB.Business.BusinessLogic;
using GDB.Common.Authentication;
using GDB.Common.DTOs.Studio;
using GDB.Common.Settings;
using GDB.EmailSending;
using GDB.EmailSending.Templates;
using GDB.Persistence;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDB.App.Tests.IntegrationTests.Controllers.General
{

    [TestFixture]
    [Category("Database-Tests")]
    public class AccountControllerTests : IntegrationTestsBase
    {
        private AccountController _controller;
        private FakeCrypto _fakeCrypto;
        private FakeCookies _fakeCookies;
        private EphemeralDataProtectionProvider _dataProtection;
        private Mock<IEmailSender> _emailSenderMock;

        [OneTimeSetUp]
        [OneTimeTearDown]
        public void OneTimeSetUp()
        {
            Database.ClearDatabase();
        }

        [SetUp]
        public void BeforeEachTest()
        {
            var persistence = new DapperPersistence(Database.GetConnectionSettings());
            var busOps = new BusinessServiceOperatorWithRetry(persistence);
            _fakeCrypto = new FakeCrypto();
            _fakeCookies = new FakeCookies();
            var signIn = new SignInManager(busOps, _fakeCrypto);
            _dataProtection = new EphemeralDataProtectionProvider();
            _emailSenderMock = new Mock<IEmailSender>();
            var addressSettings = Options.Create(new AddressSettings());

            var mockUrlHelper = new Mock<IUrlHelper>();
            mockUrlHelper.Setup(m => m.IsLocalUrl(It.IsAny<String>()))
                .Returns(true);

            _controller = new AccountController(signIn, _dataProtection, _fakeCookies, _emailSenderMock.Object, addressSettings)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext
                    {
                        Request = { Scheme = "http" }
                    }
                },
                Url = mockUrlHelper.Object
            };
        }

        [Test]
        public async Task Login_ValidCredsSingleStudio_CreatesSessionSuccessfully()
        {
            var user = Database.Users.Add("unit test", "unittest-ii@launchready.co", _fakeCrypto.HashPassword("password 123"), false);
            var studio = Database.Studios.Add("ut studio");
            Database.Studios.AssignUserAccesstoStudio(user.Id, studio.Id, true, StudioUserAccess.Active, StudioUserRole.Administrator);

            var result = await _controller.LoginAsync(new LoginModel()
            {
                Username = user.UserName,
                Password = "password 123",
                ReturnUrl = "/"
            });

            result.Should().BeOfType<LocalRedirectResult>()
                  .Which.Url.Should().Be("/");
            using (var conn = Database.GetConnection())
            {
                var sessions = conn.Query<UserSession>("SELECT * FROM UserSession WHERE UserId = @Id", user)
                    .ToList();
                sessions.Should().HaveCount(1);
            }
        }

        [Test]
        public async Task Login_ValidCredsMarkedForReset_RedirectsToReset()
        {
            var user = Database.Users.Add("unit test", "unittest-iii@launchready.co", _fakeCrypto.HashPassword("password 123"), true);
            var studio = Database.Studios.Add("ut studio");
            Database.Studios.AssignUserAccesstoStudio(user.Id, studio.Id, true, StudioUserAccess.Active, StudioUserRole.Administrator);
            _fakeCrypto.PresetResetToken = "ABC123";

            var result = await _controller.LoginAsync(new LoginModel()
            {
                Username = user.UserName,
                Password = "password 123",
                ReturnUrl = "/"
            });

            result.Should().BeOfType<RedirectToActionResult>()
                  .Which.ActionName.Should().Be("ResetPassword");
            using (var conn = Database.GetConnection())
            {
                var resets = conn.Query<string>("SELECT ResetToken FROM PasswordResetToken WHERE TargetUserId = @Id", user)
                    .ToList();
                resets.Should().HaveCount(1)
                      .And.Contain(_fakeCrypto.PresetResetToken);
            }
        }


        [Test]
        public async Task Login_InvalidUsername_ReportsError()
        {
            var user = Database.Users.Add("unit test", "unittest-iv@launchready.co", _fakeCrypto.HashPassword("password 123"), false);
            var studio = Database.Studios.Add("ut studio");
            Database.Studios.AssignUserAccesstoStudio(user.Id, studio.Id, true, StudioUserAccess.Active, StudioUserRole.Administrator);

            var result = await _controller.LoginAsync(new LoginModel()
            {
                Username = "BAD" + user.UserName,
                Password = "password 123",
                ReturnUrl = "/"
            });

            var vr = result.Should().BeOfType<ViewResult>()
                  .Which;
            vr.ViewName.Should().Be("Login");
            vr.ViewData.Should().ContainKey("ErrorMessage");
        }

        [Test]
        public async Task Login_InvalidPassword_ReportsError()
        {
            var user = Database.Users.Add("unit test", "unittest-v@launchready.co", _fakeCrypto.HashPassword("password 123"), false);
            var studio = Database.Studios.Add("ut studio");
            Database.Studios.AssignUserAccesstoStudio(user.Id, studio.Id, true, StudioUserAccess.Active, StudioUserRole.Administrator);

            var result = await _controller.LoginAsync(new LoginModel()
            {
                Username = user.UserName,
                Password = "BAD password 123",
                ReturnUrl = "/"
            });

            var vr = result.Should().BeOfType<ViewResult>()
                  .Which;
            vr.ViewName.Should().Be("Login");
            vr.ViewData.Should().ContainKey("ErrorMessage");
        }

        [Test]
        public async Task Login_NoStudiosAccessible_ReportsError()
        {
            var user = Database.Users.Add("unit test", "unittest-v-b@launchready.co", _fakeCrypto.HashPassword("password 123"), false);

            var result = await _controller.LoginAsync(new LoginModel()
            {
                Username = user.UserName,
                Password = "password 123",
                ReturnUrl = "/"
            });

            var vr = result.Should().BeOfType<ViewResult>()
                  .Which;
            vr.ViewName.Should().Be("Login");
            vr.ViewData.Should().ContainKey("ErrorMessage");
        }

        [Test]
        public async Task Login_ValidCredsMultipleStudio_OffersStudioChoice()
        {
            var user = Database.Users.Add("unit test", "unittest-vi@launchready.co", _fakeCrypto.HashPassword("password 123"), false);
            var studios = new List<AccessibleStudio> {
                Database.Studios.Add("ut studio"),  Database.Studios.Add("ut studio")
                };
            studios.ForEach(s =>
                Database.Studios.AssignUserAccesstoStudio(user.Id, s.Id, true, StudioUserAccess.Active, StudioUserRole.Administrator));


            var result = await _controller.LoginAsync(new LoginModel()
            {
                Username = user.UserName,
                Password = "password 123",
                ReturnUrl = "/"
            });

            result.Should().BeOfType<RedirectToActionResult>()
                  .Which.ActionName.Should().Be("StudioChoice");
        }

        [Test]
        public async Task StudioChoiceAsync_MultipleStudios_PresentsStudioList()
        {
            var user = Database.Users.Add("unit test", "unittest-vii@launchready.co", _fakeCrypto.HashPassword("password 123"), false);
            var studios = new List<AccessibleStudio> {
                Database.Studios.Add("ut studio"),  
                Database.Studios.Add("ut studio")
            };
            studios.ForEach(s =>
                Database.Studios.AssignUserAccesstoStudio(user.Id, s.Id, true, StudioUserAccess.Active, StudioUserRole.Administrator));

            // choice cookie value will be captured by FakeCookies object for second call
            await _controller.LoginAsync(new LoginModel()
            {
                Username = user.UserName,
                Password = "password 123",
                ReturnUrl = "/"
            });
            var result = await _controller.StudioChoiceAsync("/");

            var vr = result.Should().BeOfType<ViewResult>()
                  .Which;
            vr.Model.Should().BeOfType<StudioChoiceModel>()
                .Which.Studios.Should().BeEquivalentTo(studios);
        }

        [Test]
        public async Task StudioChoiceAsync_InvalidCookie_RedirectsBackToLoginForm()
        {
            var user = Database.Users.Add("unit test", "unittest-viii@launchready.co", _fakeCrypto.HashPassword("password 123"), false);
            var studios = new List<AccessibleStudio> {
                Database.Studios.Add("ut studio"),  Database.Studios.Add("ut studio")
                };
            studios.ForEach(s =>
                Database.Studios.AssignUserAccesstoStudio(user.Id, s.Id, true, StudioUserAccess.Active, StudioUserRole.Administrator));

            // choice cookie value will be captured by FakeCookies object for second call
            await _controller.LoginAsync(new LoginModel()
            {
                Username = user.UserName,
                Password = "password 123",
                ReturnUrl = "/"
            });
            _fakeCookies.PresetValue = "123";
            var result = await _controller.StudioChoiceAsync("/");

            var vr = result.Should().BeOfType<RedirectResult>()
                  .Which.Url.Should().Be("/account/login");
        }

        [Test]
        public async Task StudioChoiceAsync_ValidChoiceFromMultipleStudios_CreatesSessionSuccessfully()
        {
            var user = Database.Users.Add("unit test", "unittest-ix@launchready.co", _fakeCrypto.HashPassword("password 123"), false);
            var studios = new List<AccessibleStudio> {
                Database.Studios.Add("ut studio"),  Database.Studios.Add("ut studio")
                };
            studios.ForEach(s =>
                Database.Studios.AssignUserAccesstoStudio(user.Id, s.Id, true, StudioUserAccess.Active, StudioUserRole.Administrator));

            // choice cookie value will be captured by FakeCookies object for second call
            await _controller.LoginAsync(new LoginModel()
            {
                Username = user.UserName,
                Password = "password 123",
                ReturnUrl = "/"
            });
            var result = await _controller.StudioChoiceAsync(new StudioChoiceInputModel
            {
                UserId = user.Id,
                StudioId = studios[0].Id,
                ReturnUrl = "/"
            });

            result.Should().BeOfType<LocalRedirectResult>()
                  .Which.Url.Should().Be("/");
            using (var conn = Database.GetConnection())
            {
                var sessions = conn.Query<UserSession>("SELECT * FROM UserSession WHERE UserId = @Id", user)
                    .ToList();
                sessions.Should().HaveCount(1);
            }
        }

        [Test]
        public async Task StudioChoiceAsync_InvalidChoiceFromMultipleStudios_ReturnsError()
        {
            var user = Database.Users.Add("unit test", "unittest-x@launchready.co", _fakeCrypto.HashPassword("password 123"), false);
            var studios = new List<AccessibleStudio> {
                Database.Studios.Add("ut studio"),  Database.Studios.Add("ut studio")
                };
            studios.ForEach(s =>
                Database.Studios.AssignUserAccesstoStudio(user.Id, s.Id, true, StudioUserAccess.Active, StudioUserRole.Administrator));
            var inaccessibleStudio = Database.Studios.Add("bad studio");

            // choice cookie value will be captured by FakeCookies object for second call
            await _controller.LoginAsync(new LoginModel()
            {
                Username = user.UserName,
                Password = "password 123",
                ReturnUrl = "/"
            });
            var result = await _controller.StudioChoiceAsync(new StudioChoiceInputModel
            {
                UserId = user.Id,
                StudioId = inaccessibleStudio.Id,
                ReturnUrl = "/"
            });

            var vr = result.Should().BeOfType<ViewResult>()
                  .Which;
            vr.ViewName.Should().Be("StudioChoice");
            vr.ViewData.Should().ContainKey("ErrorMessage");
        }

        [Test]
        public async Task StudioChoiceAsync_NonexistentChoiceFromMultipleStudios_ReturnsError()
        {
            var user = Database.Users.Add("unit test", "unittest-xi@launchready.co", _fakeCrypto.HashPassword("password 123"), false);
            var studios = new List<AccessibleStudio> {
                Database.Studios.Add("ut studio"),  Database.Studios.Add("ut studio")
                };
            studios.ForEach(s =>
                Database.Studios.AssignUserAccesstoStudio(user.Id, s.Id, true, StudioUserAccess.Active, StudioUserRole.Administrator));

            // choice cookie value will be captured by FakeCookies object for second call
            await _controller.LoginAsync(new LoginModel()
            {
                Username = user.UserName,
                Password = "password 123",
                ReturnUrl = "/"
            });
            var result = await _controller.StudioChoiceAsync(new StudioChoiceInputModel
            {
                UserId = user.Id,
                StudioId = -9000,
                ReturnUrl = "/"
            });

            var vr = result.Should().BeOfType<ViewResult>()
                  .Which;
            vr.ViewName.Should().Be("StudioChoice");
            vr.ViewData.Should().ContainKey("ErrorMessage");
        }

        [Test]
        public void ForgotPassword_NoArgs_PresentsForm()
        {
            // no setup

            var result = _controller.ForgotPassword();

            result.Should().BeOfType<ViewResult>()
                  .Which.ViewName.Should().Be("ForgotPassword");
        }

        [Test]
        public async Task ForgotPassword_ValidUsernameSubmitted_SendsEmailAndReportsSuccess()
        {
            var user = Database.Users.Add("unit test", "unittest-xiia@launchready.co", _fakeCrypto.HashPassword("password 123"), false);
            _fakeCrypto.PresetResetToken = "token";
            _emailSenderMock.Setup(e => e.SendPasswordResetEmail(It.IsAny<string>(), It.IsAny<ResetPasswordData>()))
                            .ReturnsAsync(true);

            var result = await _controller.ForgotPasswordAsync(user.UserName);

            _emailSenderMock.Verify(e => e.SendPasswordResetEmail(user.UserName, It.Is<ResetPasswordData>(d => d.Name == user.DisplayName)), Times.Once());
            result.Should().BeOfType<ViewResult>()
                  .Which.ViewName.Should().Be("ForgotPasswordEmailSent");
            using (var conn = Database.GetConnection())
            {
                var resets = conn.Query<string>("SELECT ResetToken FROM PasswordResetToken WHERE TargetUserId = @Id", user)
                    .ToList();
                resets.Should().HaveCount(1)
                      .And.Contain(_fakeCrypto.PresetResetToken);
            }
        }

        [Test]
        public async Task ForgotPassword_EmailError_SendsEmailAndReportsEmailError()
        {
            var user = Database.Users.Add("unit test", "unittest-xiib@launchready.co", _fakeCrypto.HashPassword("password 123"), false);
            _fakeCrypto.PresetResetToken = "token";
            _emailSenderMock.Setup(e => e.SendPasswordResetEmail(It.IsAny<string>(), It.IsAny<ResetPasswordData>()))
                            .ReturnsAsync(false);

            var result = await _controller.ForgotPasswordAsync(user.UserName);

            _emailSenderMock.Verify(e => e.SendPasswordResetEmail(user.UserName, It.Is<ResetPasswordData>(d => d.Name == user.DisplayName)), Times.Once());
            result.Should().BeOfType<ViewResult>()
                  .Which.ViewName.Should().Be("ForgotPasswordEmailError");
        }

        [Test]
        public async Task ForgotPassword_InvalidUsernameSubmitted_AlsoReportsSuccess()
        {
            //no setup

            var result = await _controller.ForgotPasswordAsync("fakey@mcfakerson.com");

            result.Should().BeOfType<ViewResult>()
                  .Which.ViewName.Should().Be("ForgotPasswordEmailSent");
        }

        [Test]
        public async Task ResetPassword_ValidUsernameAndToken_PresentsPasswordForm()
        {
            var user = Database.Users.Add("unit test", "unittest-xiii@launchready.co", _fakeCrypto.HashPassword("password 123"), false);
            Database.PasswordResetTokens.AddToken(user.Id, "token", DateTime.UtcNow.AddMinutes(-5), DateTime.UtcNow.AddMinutes(5));
            _fakeCrypto.PresetResetToken = "token";

            var result = await _controller.ResetPassword(user.UserName, "token");

            var vr = result.Should().BeOfType<ViewResult>()
                  .Which;
            vr.ViewName.Should().Be("ResetPassword");
            vr.Model.Should().BeOfType<ResetPasswordModel>()
                .Which.UserId.Should().Be(user.Id);
        }

        [Test]
        public async Task ResetPassword_MismatchUsernameAndToken_PresentsPasswordForm()
        {
            var user = Database.Users.Add("unit test", "unittest-xiv@launchready.co", _fakeCrypto.HashPassword("password 123"), false);
            var user2 = Database.Users.Add("unit test", "unittest-xivb@launchready.co", _fakeCrypto.HashPassword("password 123"), false);
            Database.PasswordResetTokens.AddToken(user.Id, "token", DateTime.UtcNow.AddMinutes(-5), DateTime.UtcNow.AddMinutes(5));
            _fakeCrypto.PresetResetToken = "token";

            var result = await _controller.ResetPassword(user2.UserName, "token");

            var vr = result.Should().BeOfType<RedirectToActionResult>()
                  .Which.ActionName.Should().Be("ResetPasswordFailure");
        }

        [Test]
        public async Task ResetPassword_ExpiredToken_PresentsPasswordForm()
        {
            var user = Database.Users.Add("unit test", "unittest-xv@launchready.co", _fakeCrypto.HashPassword("password 123"), false);
            Database.PasswordResetTokens.AddToken(user.Id, "token", DateTime.UtcNow.AddMinutes(-15), DateTime.UtcNow.AddMinutes(-5));
            _fakeCrypto.PresetResetToken = "token";

            var result = await _controller.ResetPassword(user.UserName, "token");

            var vr = result.Should().BeOfType<RedirectToActionResult>()
                  .Which.ActionName.Should().Be("ResetPasswordFailure");
        }

        [Test]
        public async Task ResetPassword_ValidTokenAndPassword_IsSuccessful()
        {
            var user = Database.Users.Add("unit test", "unittest-xvii@launchready.co", _fakeCrypto.HashPassword("password 123"), false);
            var token = Database.PasswordResetTokens.AddToken(user.Id, "token", DateTime.UtcNow.AddMinutes(-5), DateTime.UtcNow.AddMinutes(5));

            var result = await _controller.ResetPassword(new ResetPasswordInputModel()
            {
                ResetToken = token.ResetToken,
                UserId = user.Id,
                Password = "ABCD1234"
            });

            var vr = result.Should().BeOfType<RedirectToActionResult>()
                  .Which.ActionName.Should().Be("ResetPasswordSuccess");
            using (var conn = Database.GetConnection())
            {
                var reset = conn.QuerySingle<PasswordResetToken>("SELECT * FROM PasswordResetToken WHERE Id = @Id", token);
                reset.UsedOn.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMilliseconds(100));

                var history = conn.Query<string>("SELECT PasswordHash FROM PasswordHistory WHERE UserId = @Id", user);
                history.Should().Contain(_fakeCrypto.HashPassword("ABCD1234"));

                var userNow = conn.QuerySingle<UserWithCreds>("SELECT * FROM [User] WHERE Id = @Id", user);
                userNow.MustResetPassword.Should().BeFalse();
                userNow.PasswordHash.Should().Be(_fakeCrypto.HashPassword("ABCD1234"));
            }
        }

        [Test]
        public async Task ResetPassword_TooShort_ReportsError()
        {
            var user = Database.Users.Add("unit test", "unittest-xviii@launchready.co", _fakeCrypto.HashPassword("password 123"), false);
            var token = Database.PasswordResetTokens.AddToken(user.Id, "token", DateTime.UtcNow.AddMinutes(-5), DateTime.UtcNow.AddMinutes(5));

            var result = await _controller.ResetPassword(new ResetPasswordInputModel()
            {
                ResetToken = token.ResetToken,
                UserId = user.Id,
                Password = "A"
            });

            var vr = result.Should().BeOfType<ViewResult>()
                  .Which;
            vr.ViewName.Should().Be("ResetPassword");
            _controller.ModelState.ErrorCount.Should().BeGreaterThan(0);
            _controller.ModelState.Should().Contain(c => c.Key == "Password")
                    .Which.Value.Errors.Should().Contain(e => e.ErrorMessage == SignInManager.ERROR_MIN_LENGTH);
            using (var conn = Database.GetConnection())
            {
                var reset = conn.QuerySingle<PasswordResetToken>("SELECT * FROM PasswordResetToken WHERE Id = @Id", token);
                reset.UsedOn.Should().BeNull();
            }
        }

        [Test]
        public async Task ResetPassword_TooLong_ReportsError()
        {
            var user = Database.Users.Add("unit test", "unittest-xix@launchready.co", _fakeCrypto.HashPassword("password 123"), false);
            var token = Database.PasswordResetTokens.AddToken(user.Id, "token", DateTime.UtcNow.AddMinutes(-5), DateTime.UtcNow.AddMinutes(5));

            var result = await _controller.ResetPassword(new ResetPasswordInputModel()
            {
                ResetToken = token.ResetToken,
                UserId = user.Id,
                Password = new string('A', 61)
            });

            var vr = result.Should().BeOfType<ViewResult>()
                  .Which;
            vr.ViewName.Should().Be("ResetPassword");
            _controller.ModelState.ErrorCount.Should().BeGreaterThan(0);
            _controller.ModelState.Should().Contain(c => c.Key == "Password")
                    .Which.Value.Errors.Should().Contain(e => e.ErrorMessage == SignInManager.ERROR_MAX_LENGTH);
            using (var conn = Database.GetConnection())
            {
                var reset = conn.QuerySingle<PasswordResetToken>("SELECT * FROM PasswordResetToken WHERE Id = @Id", token);
                reset.UsedOn.Should().BeNull();
            }
        }

        [Test]
        public async Task ResetPassword_AllWhitespace_ReportsError()
        {
            var user = Database.Users.Add("unit test", "unittest-xx@launchready.co", _fakeCrypto.HashPassword("password 123"), false);
            var token = Database.PasswordResetTokens.AddToken(user.Id, "token", DateTime.UtcNow.AddMinutes(-5), DateTime.UtcNow.AddMinutes(5));

            var result = await _controller.ResetPassword(new ResetPasswordInputModel()
            {
                ResetToken = token.ResetToken,
                UserId = user.Id,
                Password = new string(' ', 15)
            });

            var vr = result.Should().BeOfType<ViewResult>()
                  .Which;
            vr.ViewName.Should().Be("ResetPassword");
            _controller.ModelState.ErrorCount.Should().BeGreaterThan(0);
            _controller.ModelState.Should().Contain(c => c.Key == "Password")
                    .Which.Value.Errors.Should().Contain(e => e.ErrorMessage == SignInManager.ERROR_ALL_WHITESPACE);
            using (var conn = Database.GetConnection())
            {
                var reset = conn.QuerySingle<PasswordResetToken>("SELECT * FROM PasswordResetToken WHERE Id = @Id", token);
                reset.UsedOn.Should().BeNull();
            }
        }

        [Test]
        public async Task ResetPassword_AllSame_ReportsError()
        {
            var user = Database.Users.Add("unit test", "unittest-xxi@launchready.co", _fakeCrypto.HashPassword("password 123"), false);
            var token = Database.PasswordResetTokens.AddToken(user.Id, "token", DateTime.UtcNow.AddMinutes(-5), DateTime.UtcNow.AddMinutes(5));

            var result = await _controller.ResetPassword(new ResetPasswordInputModel()
            {
                ResetToken = token.ResetToken,
                UserId = user.Id,
                Password = new string('1', 15)
            });

            var vr = result.Should().BeOfType<ViewResult>()
                  .Which;
            vr.ViewName.Should().Be("ResetPassword");
            _controller.ModelState.ErrorCount.Should().BeGreaterThan(0);
            _controller.ModelState.Should().Contain(c => c.Key == "Password")
                    .Which.Value.Errors.Should().Contain(e => e.ErrorMessage == SignInManager.ERROR_ALL_SAME);
            using (var conn = Database.GetConnection())
            {
                var reset = conn.QuerySingle<PasswordResetToken>("SELECT * FROM PasswordResetToken WHERE Id = @Id", token);
                reset.UsedOn.Should().BeNull();
            }
        }

        [Test]
        public async Task ResetPassword_SameAsUsername_ReportsError()
        {
            var user = Database.Users.Add("unit test", "unittest-xxii@launchready.co", _fakeCrypto.HashPassword("password 123"), false);
            var token = Database.PasswordResetTokens.AddToken(user.Id, "token", DateTime.UtcNow.AddMinutes(-5), DateTime.UtcNow.AddMinutes(5));

            var result = await _controller.ResetPassword(new ResetPasswordInputModel()
            {
                ResetToken = token.ResetToken,
                UserId = user.Id,
                Password = "ABC-" + user.UserName + "123"
            }) ;

            var vr = result.Should().BeOfType<ViewResult>()
                  .Which;
            vr.ViewName.Should().Be("ResetPassword");
            _controller.ModelState.ErrorCount.Should().BeGreaterThan(0);
            _controller.ModelState.Should().Contain(c => c.Key == "Password")
                    .Which.Value.Errors.Should().Contain(e => e.ErrorMessage == SignInManager.ERROR_USERNAME);
            using (var conn = Database.GetConnection())
            {
                var reset = conn.QuerySingle<PasswordResetToken>("SELECT * FROM PasswordResetToken WHERE Id = @Id", token);
                reset.UsedOn.Should().BeNull();
            }
        }

        [Test]
        public async Task ResetPassword_Emoji_ReportsError()
        {
            var user = Database.Users.Add("unit test", "unittest-xxiii@launchready.co", _fakeCrypto.HashPassword("password 123"), false);
            var token = Database.PasswordResetTokens.AddToken(user.Id, "token", DateTime.UtcNow.AddMinutes(-5), DateTime.UtcNow.AddMinutes(5));

            var result = await _controller.ResetPassword(new ResetPasswordInputModel()
            {
                ResetToken = token.ResetToken,
                UserId = user.Id,
                Password = "ABC-🤦‍-123"
            });

            var vr = result.Should().BeOfType<ViewResult>()
                  .Which;
            vr.ViewName.Should().Be("ResetPassword");
            _controller.ModelState.ErrorCount.Should().BeGreaterThan(0);
            _controller.ModelState.Should().Contain(c => c.Key == "Password")
                    .Which.Value.Errors.Should().Contain(e => e.ErrorMessage == SignInManager.ERROR_CHARACTERS);
            using (var conn = Database.GetConnection())
            {
                var reset = conn.QuerySingle<PasswordResetToken>("SELECT * FROM PasswordResetToken WHERE Id = @Id", token);
                reset.UsedOn.Should().BeNull();
            }
        }
    }
}
