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
        private IWebDriver browser;
        private long lastTimeMessage = 0;
        private string nameVipChat = "Black Bet"; 
        private string nameOurChat = "Валентин"; 

        public void start()
        {
            //открываем браузер
            openBrowser();

            Thread.Sleep(1000);
            //пока пы не залогинимся - висим на этом методе
            isMyProfile();

            //выбираем диалог, который нам нужен
            chooseChatDialog(nameVipChat);

            //получаем все доступные сообщения в нем            
            List<String> messages = getAllMessage();
            //выбираем наш диалог
            chooseChatDialog(nameOurChat);
            //отправляем сообщения
            sentMessagesInOurDialog(messages);
        }

        private bool isMyProfile()
        {
            String homeLink = "https://www.web-telegram.ru/#/im";

            while (!homeLink.Equals(browser.Url)) { }
            return true;
        }

        private void chooseChatDialog(string dialogName)
        {
            //.im_dialog_peer span - по этим селекторам можем найти названия диалогов
            List<IWebElement> dialogs = browser.FindElements(By.CssSelector(".im_dialog_peer span")).ToList();

            foreach (IWebElement dialog in dialogs) {
                if (dialog.Text.Equals(dialogName)) {
                    //если название совпало - выбираем диалог
                    dialog.Click();
                    //уснули, чтобы он успел подгрузить все сообщения
                    Thread.Sleep(2000);
                }
            }
        }
    
        private List<String> getAllMessage()
        {
            // im_message_text - селектор сообщения
            List<IWebElement> messagesContainer = browser.FindElements(By.CssSelector(".im_message_text")).ToList();

            List<string> messagesText = new List<string> { };

            foreach (IWebElement messageContainer in messagesContainer) {
                //кладем текст сообщения (можно поставить фильтры на ссылки, например)
                if(!messageContainer.Text.Equals(""))
                messagesText.Add(messageContainer.Text);           
            }
            return messagesText;
        }

        private void sentMessagesInOurDialog(List<string> messages)
        {
            foreach (String message in messages)
            {
                //.composer_rich_textarea - инпут куда стоит вставить текст
                IWebElement answerPlace = browser.FindElement(By.CssSelector(".composer_rich_textarea"));
                //OpenQA.Selenium.Keys.Enter - нажатие клавиши 
                answerPlace.SendKeys(message + OpenQA.Selenium.Keys.Enter);
                Thread.Sleep(1500);
            }

        }

        private void openBrowser()
        {
            // открыть 
            browser = new OpenQA.Selenium.Chrome.ChromeDriver();

            //открываю браузер на весь экран
            browser.Manage().Window.Maximize();

            // отправляемся по ссылке
            browser.Navigate().GoToUrl("https://www.web-telegram.ru");              
        }


     
    }
}
