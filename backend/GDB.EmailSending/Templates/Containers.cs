using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.EmailSending.Templates
{
    public static class Containers
    {
        public static string FontSize = "16px";
        public static string Width = "760px";

        public static string Start()
        {
            return @"
            <table bgcolor='" + Colors.BackgroundColor + @"' width='100%'>
                <tr><td>&nbsp;</td></tr>
                <tr>
                    <td>
            <table border='0' cellpadding='0' cellspacing='0' align='center'
                bgcolor = '" + Colors.ContentBackgroundColor + @"'
                width = '" + Width + @"' style = 'border-collapse: collapse; border-spacing: 0; padding: 0; width: inherit; max-width: " + Width + @";'
                class='container'>
                <tr>
                    <td align='left' valign='top' style='border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: " + FontSize + @"; font-weight: 400; line-height: 160%;
                        padding-top: 25px; text-align: center;
                    color: " + Colors.TextColorLight + @"; font-family: sans-serif;'>
                        <a href='https://www.launchready.co' style='text-decoration: none; color: " + Colors.TextColorLight + @"'><img alt='LaunchReady' src='https://www.launchready.co/images/CircleArrow56.png' width='56' height='56' style='max-width:250px; color: " + Colors.AnchorColor + @"' /></a>
                    </td>
                </tr>
            ";
        }

        public static string End()
        {
            return @"
                <tr><td>&nbsp;</td></tr>
            </table>
                <tr><td>&nbsp;</td></tr>
                <tr>
                    <td align='left' valign='top' style='border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: " + FontSize + @"; font-weight: 400; line-height: 160%;
                        padding-top: 25px; text-align: center;
                    color: " + Colors.TextColorLight + @";
                        font-family: sans-serif;'>
                        Copyright 2021 LaunchReady Software, LLC<br />
                        315 Indigo Dr, Cary NC  27513<br />
                        <a href='https://www.launchready.co' style='text-decoration: none; color: " + Colors.TextColorLight + @"'>www.launchready.co</a>
                    </td>
                </tr>
            </table>
            ";
        }

        public static string StartParagraph()
        {
            return @"
            <tr>
                <td align='left' valign='top' style='border-collapse: collapse; border-spacing: 0; margin: 0; padding: 0; padding-left: 6.25%; padding-right: 6.25%; width: 87.5%; font-size: " + FontSize + @"; font-weight: 400; line-height: 160%;
                    padding-top: 25px;
                color: " + Colors.TextColor + @";
                    font-family: sans-serif; text-align: left;' class='paragraph'>
            ";
        }
        public static string EndParagraph()
        {
            return @"
                </td>
            </tr>
            ";
        }

        public static string ButtonStyle()
        {
            return $"color: #fff; background-color: {Colors.AnchorColor}; white-space: nowrap; padding: 0.75em 1.75em; border-radius: 4px; text-decoration: none; display: inline-block; text-align: center";
        }
    }
}
