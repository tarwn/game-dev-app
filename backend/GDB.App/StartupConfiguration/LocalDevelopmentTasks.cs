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

namespace GDB.App.StartupConfiguration
{
    public class LocalDevelopmentTasks
    {
        internal static void MigrateDatabase(IConfiguration configuration)
        {
            LocalDatabaseMigrator.Execute(configuration.GetConnectionString("Database"));
        }

        internal static void StartFrontendService(ISpaBuilder spaBuilder, string workingDirectory, string exeToRun, Func<int, string> commandFromPort)
        {
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

            var processStartInfo = new ProcessStartInfo(exeToRun)
            {
                Arguments = completeArguments,
                UseShellExecute = false,
                RedirectStandardInput = true,
                RedirectStandardOutput = false,
                RedirectStandardError = false,
                WorkingDirectory = workingDirectory
            };
            //processStartInfo.Environment["PORT"] = port.ToString();
            var process = Process.Start(processStartInfo);
            process.EnableRaisingEvents = true;

            // 127.0.0.1 vs localhost may resolve occasional 2 second delays in load times, haven't identified root cause
            var uri = new UriBuilder("http", "127.0.0.1", port).Uri;
            var timeout = spaBuilder.Options.StartupTimeout;
            // currently hardcoded wait instead of examining script output
            var task = Task.Delay(timeout);
            spaBuilder.UseProxyToSpaDevelopmentServer(() =>
            {
                return task.ContinueWith((t) => uri);
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
}
