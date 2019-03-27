using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Drawing;
using System.Windows.Forms;
using OpenQA.Selenium.Internal;
using OpenQA.Selenium.Interactions;

namespace BlackBet
{
    class BlackBetBot
    {
        IWebDriver browser;
        private long lastTimeMessage = 0;
        private string nameVipChat = "Black Bet";
        private string nameOurChat = "Mark";
        private string maxWindow = "start-maximized"; // максимизация окна
        List<Image> images = new List<Image>();

        // Max_Astin
        private string pathToMyChromeProfile = "--user-data-dir=F:\\uni\\6. SAOD\\Black Bet\\Default";        
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

            //выбираем VIP диалог
            chooseChatDialog(nameVipChat);
            Thread.Sleep(4000);

            //получаем вермя последнего сообщения
            while (true)
            {
                long messageTime = getLastMessageTime();

                if (lastTimeMessage < messageTime)
                {
                    //получаем все доступные сообщения в нем
                    List<Object> messages = getNewMessages(lastTimeMessage);
                    lastTimeMessage = messageTime;
                    Thread.Sleep(1000);

                    //выбираем наш диалог
                    chooseChatDialog(nameOurChat);
                    Thread.Sleep(1000);
                    //отправляем сообщения
                    sentMessagesInOurDialog(messages);

                    //выбираем VIP диалог
                    chooseChatDialog(nameVipChat);
                    Thread.Sleep(1000);
                }
                Thread.Sleep(100);
            }
            
        }

        private void openBrowser()
        {
            ChromeOptions co = new ChromeOptions();
            co.AddExtensions(pathToExtension);
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
                    if (messageTime.Equals(""))
                    {
                        // получилось, но текст пусой, поэтому ищем дальше
                        continue;
                    }
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
                    if (messageDate.Equals(""))
                    {
                        // получилось, но текст пусой, поэтому ищем дальше
                        continue;
                    }
                    break;
                }
                catch
                {
                    // не получилось, потому что нет даты в сообщении
                    continue;
                }
            }

            // конвертируем полученную дату и время в милисекунды
            var longTime = convertDateToLong(messageDate, messageTime);

            return longTime; 
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

        // потом исправлю
        private List<Object> getNewMessages(long lastMessageTime)
        {
            // im_message_text - селектор сообщения
            // List<IWebElement> messagesContainer = browser.FindElements(By.CssSelector(".im_message_text")).ToList();
            var messageList = browser.FindElements(By.CssSelector(".im_history_message_wrap")); //список сообщений
            var messageTime = "";
            var messageDate = "";
            var dateLong = lastMessageTime - (lastMessageTime % 86400000);
            var messageText = "";
            Image messageImage = null;
            List<Object> messages = new List<Object>();

            // идём по списку снизу вверх
            for (int i = messageList.Count - 1; i >= 0; i--)
            {
                try
                {
                    messageDate = messageList[i].FindElement(By.CssSelector(".im_message_date_split_text")).Text;
                }
                catch
                {
                    messageDate = "";
                    // дата остаётся той же
                }

                // пытаюсь получить время и текст сообщения с текстом
                try
                {
                    messageTime = messageList[i].FindElement(By.CssSelector(".im_message_date_text.nocopy")).GetAttribute("data-content");
                    messageText = messageList[i].FindElement(By.CssSelector(".im_message_text")).Text;

                    // текста нет, значит там картинка
                    if (messageText.Equals(""))
                    {
                        IWebElement imageElement = messageList[i].FindElements(By.CssSelector(".im_message_photo_thumb")).Last();
                        Actions action = new Actions(browser);
                        action.ContextClick(imageElement)
                            .SendKeys(OpenQA.Selenium.Keys.ArrowDown)
                            .SendKeys(OpenQA.Selenium.Keys.ArrowDown)
                            .SendKeys(OpenQA.Selenium.Keys.ArrowDown)
                            .SendKeys(OpenQA.Selenium.Keys.Enter)
                            .Perform();

                        if (Clipboard.ContainsImage())
                        {
                            messageImage = Clipboard.GetImage();
                        }
                    }
                }
                catch
                {
                    messageTime = "";
                    messageText = "";
                    // не получилось, потому что это сообщение без времени (добавление участника в чат например)
                }

                // если это сообщение с текстом и временем
                if (!messageTime.Equals(""))
                {
                    // возможно стоит добавить его в список
                    if (compareDates(lastMessageTime, dateLong, messageTime))
                    {
                        messages.Add(messageText);
                        if (messageText.Equals(""))
                        {
                            messages.Add(messageImage);
                        }
                    }
                    else
                    {
                        return messages;
                    }
                }

                // Если у текущего сообщения есть дата, то вычитаем 1 день для следующих
                if (!messageDate.Equals(""))
                {
                    dateLong -= 86400000;
                }
            }

            return messages;
        }

        private bool compareDates(long lastMessageTime, long dateLong, string messageTime)
        {
            long timeLong = convertDateToLong("", messageTime);
            long currentMessageTime = dateLong + timeLong;

            if (lastMessageTime < currentMessageTime)
            {
                return true;
            }

            return false;
        }

        private void sentMessagesInOurDialog(List<Object> messages)
        {
            IWebElement answerPlace = browser.FindElement(By.CssSelector(".composer_rich_textarea"));

            // переворачиваем чтобы отправлять
            messages.Reverse();
            foreach (Object message in messages)
            {
                if (message is string)
                {
                    answerPlace.SendKeys(message + OpenQA.Selenium.Keys.Return);
                }
                else
                {
                    Clipboard.SetImage((Image)message);
                    answerPlace.SendKeys(OpenQA.Selenium.Keys.Control + "v");
                    answerPlace.SendKeys(OpenQA.Selenium.Keys.Enter);
                }
                
                Thread.Sleep(100);
            }

        }

        private void getMessageTime()
        {
        }

        private long convertDateToLong(string date, string time)
        {
            string[] times = time.Split(); // times[0] - время  times[1] - PM/AM
            DateTime commonTime;


            if (date.Equals(""))
            {
                date = String.Format("{0:dddd, MMMM d, yyyy}", new DateTime(1970, 1, 1));
                commonTime = DateTime.Parse(date + " " + times[0]);
            } else
            {
                commonTime = DateTime.Parse(date + " " + times[0]);
            }
            long longTime = (long)(commonTime - new DateTime(1970, 1, 1)).TotalMilliseconds;

            if (times[1].Equals("PM"))
            {
                longTime += 43200000; //+ 12 часов
            }

            return longTime;
        }


    }
}
