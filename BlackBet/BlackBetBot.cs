using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;




namespace BlackBet
{
    class BlackBetBot
    {
        IWebDriver browser;
        private long lastTimeMessage = 0;
        private string nameVipChat = "Black Bet";
        private string nameOurChat = "Mark";
        private string maxWindow = "start-maximized"; // максимизация окна

        // Max_Astin
        private string pathToMyChromeProfile = "--user-data-dir=F:\\uni\\6. SAOD\\Black Bet\\BlackBet\\Default";        
        private string pathToExtension = @"F:\uni\6. SAOD\Black Bet\BlackBet\BlackBet\bin\Debug\TLext.crx";

        //Hidailo
        //private string pathToMyChromeProfile = "--user-data-dir=D:\ChomeOptions\Default";
        //private string pathToExtension = @"D:\ChomeOptions\Tlext.crx";


        public void start()
        {
            //получаем текущее время
            lastTimeMessage = DateTimeOffset.Now.ToUnixTimeMilliseconds() + 10800000; // 

            //открываем браузер
            openBrowser();
            Thread.Sleep(4000);
            //пока пы не залогинимся - висим на этом методе
            isMyProfile();
            Thread.Sleep(4000);

            //выбираем диалог, который нам нужен
            chooseChatDialog(nameVipChat);
            Thread.Sleep(4000);

            //получаем вермя последнего сообщения
            while (true)
            {
                long messageTime = getLastMessageTime();

                if (lastTimeMessage < messageTime)
                {
                    //получаем все доступные сообщения в нем
                    List<String> messages = getAllMessage();
                    Thread.Sleep(4000);

                    /*//выбираем наш диалог
                    chooseChatDialog(nameOurChat);
                    Thread.Sleep(4000);
                    //отправляем сообщения
                    sentMessagesInOurDialog(messages);*/
                }
                Thread.Sleep(100);
            }
        }

        private long getLastMessageTime()
        {
            var messageList = browser.FindElements(By.CssSelector(".im_history_message_wrap")); //список сообщений
            var messageTime = ""; // время последнего сообщения с текстом
            var messageIndex = 0; // индекс последнего сообщения с текстом~
            var messageDate = ""; // дата последнего сообщения с текстом

            // идём по списку снизу вверх
            for (int i = messageList.Count-1; i >= 0; i--)
            {
                // пытаюсь получить время и индекс последнеднего сообщения с текстом
                try
                {
                    messageTime = messageList[i].FindElement(By.CssSelector(".im_message_date_text.nocopy")).GetAttribute("data-content");
                    messageIndex = i;
                    break;
                }
                catch
                {
                    // не получилось, потому что это сообщение без времени (добавление участника в чат например)
                    // смотрим следующее сообщение
                    continue;
                }
            }

            // идём по списку снизу вверх начиная с нашего сообщения включительно
            for (int i = messageIndex; i >= 0; i--)
            {
                // ищем сообщение с датой
                try
                {
                    messageDate = messageList[i].FindElement(By.CssSelector(".im_message_date_split_text")).Text;
                    break;
                }
                catch
                {
                    // не получилось, потому что нет даты в сообщении
                    continue;
                }
            }

            // конвертируем полученную дату и время в милисекунды
            string[] messageTimes = messageTime.Split(); // times[0] - время  times[1] - PM/AM
            DateTime commonTime = DateTime.Parse(messageDate + " " + messageTimes[0]);

            long longTime = (long)(commonTime - new DateTime(1970, 1, 1)).TotalMilliseconds;

            if (messageTimes[1].Equals("PM"))
            {
                longTime += 43200000; //+ 12 часов
            }

            return longTime; 
        }

        private void openBrowser()
        {
            ChromeOptions co = new ChromeOptions();
            //co.AddExtensions(pathToExtension);
            co.AddArguments(pathToMyChromeProfile);
            co.AddArgument(maxWindow);
            // открыть 
            browser = new ChromeDriver(co);

            // отправляемся по ссылке
            browser.Navigate().GoToUrl("https://web.telegram.org");
        }

        private bool isMyProfile()
        {
            String homeLink = "https://web.telegram.org/#/im";

            while (!homeLink.Equals(browser.Url)) { }
            return true;
        }

        private void chooseChatDialog(string dialogName)
        {
            //.im_dialog_peer span - по этим селекторам можем найти названия диалогов
            List<IWebElement> dialogs = browser.FindElements(By.CssSelector(".im_dialog_peer span")).ToList();

            foreach (IWebElement dialog in dialogs)
            {
                string name = dialog.Text;
                if (dialog.Text.Equals(dialogName))
                {
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
            foreach (IWebElement messageContainer in messagesContainer)
            {
                //кладем текст сообщения (можно поставить фильтры на ссылки, например)
                if (!messageContainer.Text.Equals(""))
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

        private void getMessageTime()
        {
        }


    }
}
