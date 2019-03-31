using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Threading;

namespace BlackBet
{
    public partial class Form1 : Form
    {
        BlackBetBot blackBetBot;
        private string nameVipChat = "BlackBot"; //Making Cash | Хоккей🏒
        private string nameOurChat = "Mark";

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
            String fromChat = fromTB.Text;
            String toChat = toTB.Text;
            if (!fromChat.Equals("") && (!toChat.Equals("")))
            {
                timer1.Enabled = true;
                Thread browserThread = new Thread(botStart);
                browserThread.Start();
            }
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
            blackBetBot.start(nameVipChat, nameOurChat);
        }
    }
}
