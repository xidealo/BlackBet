using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Drawing;
using System.Windows.Forms;
using OpenQA.Selenium.Interactions;
using System.IO;
using OpenQA.Selenium.Firefox;

namespace BlackBet
{
    class BlackBetBot
    {
        private IWebDriver browser;
        private long lastTimeMessage = 0;
        private string maxWindow = "start-maximized"; // максимизация окна
        private string nameVipChat; 
        private string nameOurChat;
        private string oneSymbolMessage = "";

        //Max_Astin
        //private string pathToMyChromeProfile = "--user-data-dir=F:\\uni\\6. SAOD\\Black Bet\\Default";
        //private string pathToExtension = @"F:\uni\6. SAOD\Black Bet\BlackBet\BlackBet\bin\Debug\TLext.crx";
        //private string downloadingPath = @"F:\Downloads";

        //Hidailo
        /*private string pathToMyChromeProfile = "--user-data-dir=D:\\ChomeOptions\\Default";
        private string pathToExtension = @"D:\ChomeOptions\Tlext.crx";
        private string downloadingPath = @"C:\Users\Ideal\Downloads";*/

        //server 
        private string pathToMyChromeProfile = "--user-data-dir=C:\\ChomeOptions\\Default";
        private string pathToExtension = @"C:\ChomeOptions\Tlext.crx";
        private string downloadingPath = @"C:\Users\Administrator\Downloads";

        public void start(String vipChat, String ourChat)
        {
            //получаем имена чатов
            nameVipChat = vipChat;
            nameOurChat = ourChat;

            //получаем текущее время
            lastTimeMessage = DateTimeOffset.Now.ToUnixTimeMilliseconds() + 10800000; // 

            //открываем браузер
            //openFirefoxBrowser();
            openChromeBrowser();
            Thread.Sleep(2000);
            //пока пы не залогинимся - висим на этом методе
            isMyProfile();
            Thread.Sleep(1000);

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

        private void openFirefoxBrowser()
        {      
            FirefoxProfileManager binary = new FirefoxProfileManager();
            FirefoxProfile prof = binary.GetProfile("Selenium");
            FirefoxOptions co = new FirefoxOptions();
            co.Profile = prof;
            browser = new FirefoxDriver(co);
        
            // отправляемся по ссылке  
            browser.Navigate().GoToUrl("https://web.telegram.org");

            //https://web.telegram.org
        }

        private void openChromeBrowser()
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
            for (int i = messageList.Count - 1; i >= 0; i--)
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
                   
                    break;
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

                    // если это сообщение с временем
                    if (!messageTime.Equals(""))
                    {
                        // возможно стоит добавить его в список
                        if (compareDates(lastMessageTime, dateLong, messageTime))
                        {
                            messageText = messageList[i].FindElement(By.CssSelector(".im_message_text")).Text;
                            //если текста нет, то это картинка
                            if (messageText.Equals(""))
                            {
                                messages.Add(loadImage(messageList[i]));
                            }
                            else
                            {
                                if (filterText(messageText))
                                {
                                    messages.Add(messageText);
                                }
                            }
                        }
                        else
                        {
                            return messages;
                        }
                    }
                }
                catch
                {
                    messageTime = "";
                    messageText = "";
                    // не получилось, потому что это сообщение без времени (добавление участника в чат например)
                }

                // Если у текущего сообщения есть дата, то вычитаем 1 день для следующих
                if (!messageDate.Equals(""))
                {
                    dateLong -= 86400000;
                }
            }

            return messages;
        }

        private bool filterText(string messageText)
        {
            if (messageText.Contains("http")) return false;
            if (messageText.Contains("@")) return false;
            if (messageText.Contains("подпис")) return false;
            if (messageText.Contains("отзыв")) return false;
            
            return true;
        }

        private Image loadImage(IWebElement msgElement)
        {
            IWebElement imageElement = msgElement.FindElements(By.CssSelector(".im_message_photo_thumb")).Last();
            imageElement.Click();

            IWebElement downloadBtn = browser.FindElement(By.CssSelector(".media_modal_action_btn_download"));
            downloadBtn.Click();

            Thread.Sleep(5000);

            Actions action = new Actions(browser);
            action.SendKeys(OpenQA.Selenium.Keys.Escape).Perform();

            Thread.Sleep(500);

            string photoPath = Directory.GetFiles(downloadingPath, "*.jpg").Last();
            Image image;
            using (var fStream = File.OpenRead(photoPath))
            {
                image = Image.FromStream(fStream);
            }
            File.Delete(photoPath);

            return image;
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
                //если один символ в строчке, то мы его склеиваем со следующим
                if (checkOneSymbol(message)) {
                    oneSymbolMessage = message.ToString();
                    continue;
                }
                
                if (message is string)
                {                   
                    try
                    {
                        oneSymbolMessage +=message;
                        answerPlace.SendKeys(oneSymbolMessage + OpenQA.Selenium.Keys.Return);
                        oneSymbolMessage = "";
                    }
                    catch {
                        continue;
                    }                  
                }
                else
                {
                    Clipboard.Clear();
                    Clipboard.SetImage((Image)message);
                    Thread.Sleep(100);
                    answerPlace.SendKeys(OpenQA.Selenium.Keys.Control + "v");
                    IWebElement confirmationBtn = browser.FindElements(By.CssSelector(".md_simple_modal_footer .btn")).Last();
                    confirmationBtn.Click();
                    Thread.Sleep(2000);
                }

                Thread.Sleep(100);
            }

        }

        private bool checkOneSymbol(object message)
        {
            if (message is string)
            {
                return message.ToString().Length == 1;
            }
            return false;
        }

        private long convertDateToLong(string date, string time)
        {
            DateTime commonTime;

            if (date.Equals(""))
            {
                date = String.Format("{0:dddd, MMMM d, yyyy}", new DateTime(1970, 1, 1));
                commonTime = DateTime.Parse(date + " " + time);
            }
            else
            {
                commonTime = DateTime.Parse(date + " " + time);
            }
            long longTime = (long)(commonTime - new DateTime(1970, 1, 1)).TotalMilliseconds;

            return longTime;
        }
    }
}
