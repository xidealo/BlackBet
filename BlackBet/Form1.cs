using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace BlackBet
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }
        BlackBetBot blackBetBot;
        private void Form1_Load(object sender, EventArgs e)
        {
            blackBetBot = new BlackBetBot();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            String fromChat = fromTB.Text;
            String toChat = toTB.Text;
            if (!fromChat.Equals("") && (!toChat.Equals(""))) {
                timer1.Enabled = true;
                blackBetBot.start(fromChat, toChat);
            }
            
        }

        private long timer = 0;
        private void timer1_Tick(object sender, EventArgs e)
        {
            timer++;
            myTimer.Text = "Working time " + timer;
        }
    }
}
