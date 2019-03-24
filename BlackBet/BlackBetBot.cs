using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;

namespace BlackBet
{
    class BlackBetBot
    {
        IWebDriver browser;

        public void start()
        {
            //открываем браузер
            openBrowser();

            Thread.Sleep(1000);
        }

        private void openBrowser()
        {
            // открыть вк 
            browser = new OpenQA.Selenium.Chrome.ChromeDriver();

            //открываю браузер на весь экран
            browser.Manage().Window.Maximize();

            // отправляемся по ссылке
            browser.Navigate().GoToUrl("https://www.web-telegram.ru");

        }
    }
}
