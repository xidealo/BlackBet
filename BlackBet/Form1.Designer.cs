namespace BlackBet
{
    partial class Form1
    {
        /// <summary>
        /// Обязательная переменная конструктора.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Освободить все используемые ресурсы.
        /// </summary>
        /// <param name="disposing">истинно, если управляемый ресурс должен быть удален; иначе ложно.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Код, автоматически созданный конструктором форм Windows

        /// <summary>
        /// Требуемый метод для поддержки конструктора — не изменяйте 
        /// содержимое этого метода с помощью редактора кода.
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            this.startBlackBetBotBtn = new System.Windows.Forms.Button();
            this.fromTB = new System.Windows.Forms.TextBox();
            this.toTB = new System.Windows.Forms.TextBox();
            this.label1 = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this.myTimer = new System.Windows.Forms.Label();
            this.timer1 = new System.Windows.Forms.Timer(this.components);
            this.SuspendLayout();
            // 
            // startBlackBetBotBtn
            // 
            this.startBlackBetBotBtn.Location = new System.Drawing.Point(160, 206);
            this.startBlackBetBotBtn.Name = "startBlackBetBotBtn";
            this.startBlackBetBotBtn.Size = new System.Drawing.Size(184, 22);
            this.startBlackBetBotBtn.TabIndex = 0;
            this.startBlackBetBotBtn.Text = "Запустить";
            this.startBlackBetBotBtn.UseVisualStyleBackColor = true;
            this.startBlackBetBotBtn.Click += new System.EventHandler(this.button1_Click);
            // 
            // fromTB
            // 
            this.fromTB.Location = new System.Drawing.Point(160, 141);
            this.fromTB.Name = "fromTB";
            this.fromTB.Size = new System.Drawing.Size(184, 20);
            this.fromTB.TabIndex = 1;
            this.fromTB.Text = "Making Cash | Хоккей🏒";
            // 
            // toTB
            // 
            this.toTB.Location = new System.Drawing.Point(160, 180);
            this.toTB.Name = "toTB";
            this.toTB.Size = new System.Drawing.Size(184, 20);
            this.toTB.TabIndex = 2;
            this.toTB.Text = "Black Bet";
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(157, 125);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(84, 13);
            this.label1.TabIndex = 3;
            this.label1.Text = "Из какого чата";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(157, 164);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(66, 13);
            this.label2.TabIndex = 4;
            this.label2.Text = "В какой чат";
            // 
            // myTimer
            // 
            this.myTimer.AutoSize = true;
            this.myTimer.Location = new System.Drawing.Point(157, 231);
            this.myTimer.Name = "myTimer";
            this.myTimer.Size = new System.Drawing.Size(56, 13);
            this.myTimer.TabIndex = 5;
            this.myTimer.Text = "WorkTime";
            // 
            // timer1
            // 
            this.timer1.Interval = 1000;
            this.timer1.Tick += new System.EventHandler(this.timer1_Tick);
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(484, 461);
            this.Controls.Add(this.myTimer);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.toTB);
            this.Controls.Add(this.fromTB);
            this.Controls.Add(this.startBlackBetBotBtn);
            this.Name = "Form1";
            this.Text = "Form1";
            this.Load += new System.EventHandler(this.Form1_Load);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button startBlackBetBotBtn;
        private System.Windows.Forms.TextBox fromTB;
        private System.Windows.Forms.TextBox toTB;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Label myTimer;
        private System.Windows.Forms.Timer timer1;
    }
}

