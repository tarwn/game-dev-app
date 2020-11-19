using GDB.Tools.DatabaseMigration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.SpaServices;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using System.Net.Http;
using System.Reflection.Metadata.Ecma335;
using System.Text;
using System.Security.Policy;

namespace GDB.App.StartupConfiguration
{
    public class LocalDevelopmentTasks
    {
        internal static void MigrateDatabase(string connectionString)
        {
            LocalDatabaseMigrator.Execute(connectionString);
        }

        internal static void StartFrontendService(ISpaBuilder spaBuilder, string workingDirectory, string exeToRun, Func<int, string> commandFromPort, string textForServerStart)
        {
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
            Console.OutputEncoding = Encoding.Default;

            var port = GetUnusedPort();

            var completeArguments = $"{commandFromPort(port)}";
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                // On Windows, the node executable is a .cmd file, so it can't be executed
                // directly (except with UseShellExecute=true, but that's no good, because
                // it prevents capturing stdio). So we need to invoke it via "cmd /c".
                completeArguments = $"/c {exeToRun} {completeArguments}";
                exeToRun = "cmd";
            }

            var task = new TaskCompletionSource<Uri>();
            var uri = new UriBuilder("http", "127.0.0.1", port).Uri;

            var processStartInfo = new ProcessStartInfo(exeToRun)
            {
                Arguments = completeArguments,
                UseShellExecute = false,
                RedirectStandardInput = true,
                RedirectStandardOutput = true,
                RedirectStandardError = false,
                WorkingDirectory = workingDirectory
            };
            processStartInfo.Environment["PORT"] = port.ToString();
            var process = Process.Start(processStartInfo);
            process.EnableRaisingEvents = true;
            process.OutputDataReceived += new DataReceivedEventHandler((sender, e) =>
            {
                Console.WriteLine(e.Data);
                if (e.Data != null && e.Data.Contains(textForServerStart))
                {
                    task.SetResult(uri);
                }
            });
            process.BeginOutputReadLine();

            // 127.0.0.1 vs localhost may resolve occasional 2 second delays in load times, haven't identified root cause
            
            var timeout = spaBuilder.Options.StartupTimeout;
            // currently hardcoded wait instead of examining script output
            spaBuilder.UseProxyToSpaDevelopmentServer(() =>
            {
                return task.Task.WithTimeout(timeout,
                    $"The javascript server did not start listening for requests " +
                    $"within the timeout period of {timeout.Seconds} seconds. " +
                    $"Check the log output for error information.");
            });
        }


        private static readonly IPEndPoint DefaultLoopbackEndpoint = new IPEndPoint(IPAddress.Loopback, port: 0);

        internal static int GetUnusedPort()
        {
            // copy and paste from the internets!
            using (var socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp))
            {
                socket.Bind(DefaultLoopbackEndpoint);
                return ((IPEndPoint)socket.LocalEndPoint).Port;
            }
        }
    }


    // Copyright (c) .NET Foundation. All rights reserved.
    // Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.
    // Source: https://github.com/dotnet/aspnetcore/blob/master/src/Middleware/SpaServices.Extensions/src/Util/TaskTimeoutExtensions.cs
    internal static class TaskTimeoutExtensions
    {
        public static async Task WithTimeout(this Task task, TimeSpan timeoutDelay, string message)
        {
            if (task == await Task.WhenAny(task, Task.Delay(timeoutDelay)))
            {
                task.Wait(); // Allow any errors to propagate
            }
            else
            {
                throw new TimeoutException(message);
            }
        }

        public static async Task<T> WithTimeout<T>(this Task<T> task, TimeSpan timeoutDelay, string message)
        {
            if (task == await Task.WhenAny(task, Task.Delay(timeoutDelay)))
            {
                return task.Result;
            }
            else
            {
                throw new TimeoutException(message);
            }
        }
    }
}
