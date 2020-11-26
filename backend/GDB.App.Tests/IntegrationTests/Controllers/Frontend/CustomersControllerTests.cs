using GDB.App.Controllers.Frontend;
using GDB.Business.BusinessLogic;
using GDB.Common.DTOs.Customer;
using GDB.Persistence;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace GDB.App.Tests.IntegrationTests.Controllers.Frontend
{
    [TestFixture]
    public class CustomersControllerTests : IntegrationTestsBase
    {
        private CustomersController _controller;

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            Database.ClearDatabase();
        }

        [SetUp]
        public void BeforeEachTest()
        {
            var persistence = new DapperPersistence(Database.GetConnectionSettings());
            var busOps = new BusinessServiceOperatorWithRetry(persistence);
            var service = new InteractiveUserQueryService(busOps);
            _controller = new CustomersController(service)
            {
                ControllerContext = GetControllerContextForFrontEnd()
            };
        }

        [Test]
        public async Task GetCustomersAsync_NoParams_ReturnsAllCustomers()
        {
            var customer = Database.Customers.Add("unit test name");

            var result = await _controller.GetCustomersAsync();

            var resultList = AssertResponseIs<OkObjectResult, List<CustomerDTO>>(result);
            resultList.Should().HaveCount(1)
                .And.ContainEquivalentOf(customer);
        }
    }
}
