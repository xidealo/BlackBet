using System;
using System.Threading;
using System.Windows.Forms;

namespace BlackBet
{
    public partial class Form1 : Form
    {
        BlackBetBot blackBetBot;

        public Form1()
        {
            InitializeComponent();
        }
        private void Form1_Load(object sender, EventArgs e)
        {
            blackBetBot = new BlackBetBot();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            timer1.Enabled = true;
            Thread browserThread = new Thread(botStart);
            browserThread.SetApartmentState(ApartmentState.STA);
            browserThread.Start();
        }

        private long timer = 0;
        private void timer1_Tick(object sender, EventArgs e)
        {
            timer++;
            
            TimeSpan time = TimeSpan.FromSeconds(timer);
            string timeString = string.Format("{0:D2} ч:{1:D2} м:{2:D2} с",
                time.Hours,
                time.Minutes,
                time.Seconds);
            myTimer.Text = "Working time " + timeString;
        }

        private void botStart()
        {
            //Black Bet админов чат
            string nameVipChat = fromTB.Text;
            string nameOurChat = toTB.Text;

            blackBetBot.start(nameVipChat, nameOurChat);
        }
    }
}
