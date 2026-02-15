require('dotenv').config();
const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const db = require('./config/database');

class PlaylistExporter {
  constructor() {
    // Deteksi environment
    const isProduction = process.env.NODE_ENV === 'production';

    // Konfigurasi SMTP yang fleksibel
    const smtpConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true', // Untuk port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };

    // Untuk Mailtrap/Ethereal, secure harus false
    if (
      process.env.SMTP_HOST.includes('mailtrap') ||
      process.env.SMTP_HOST.includes('ethereal')
    ) {
      smtpConfig.secure = false;
      smtpConfig.requireTLS = true;
    }

    // Untuk development, tambahkan timeout
    if (!isProduction) {
      smtpConfig.connectionTimeout = 10000;
      smtpConfig.greetingTimeout = 10000;
      smtpConfig.socketTimeout = 30000;
      smtpConfig.tls = {
        rejectUnauthorized: false,
      };
    }

    this._transporter = nodemailer.createTransport(smtpConfig);
  }

  async getPlaylistData(playlistId) {
    const playlistQuery = {
      text: `SELECT p.id, p.name, u.username 
             FROM playlists p 
             JOIN users u ON p.owner = u.id 
             WHERE p.id = $1`,
      values: [playlistId],
    };

    const playlistResult = await db.query(playlistQuery);
    if (!playlistResult.rows.length) {
      throw new Error('Playlist tidak ditemukan');
    }

    const songsQuery = {
      text: `SELECT s.id, s.title, s.performer 
             FROM songs s 
             JOIN playlist_songs ps ON s.id = ps.song_id 
             WHERE ps.playlist_id = $1`,
      values: [playlistId],
    };

    const songsResult = await db.query(songsQuery);

    return {
      playlist: {
        id: playlistResult.rows[0].id,
        name: playlistResult.rows[0].name,
        songs: songsResult.rows,
      },
    };
  }

  async sendEmail(to, playlistData) {
    const mailOptions = {
      from: `"OpenMusic API" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Ekspor Playlist - OpenMusic API',
      html: `
        <h2>Ekspor Playlist</h2>
        <p>Berikut adalah data playlist yang Anda minta.</p>
        <p>File JSON terlampir dalam email ini.</p>
        <hr>
        <p>OpenMusic API</p>
      `,
      attachments: [
        {
          filename: 'playlist.json',
          content: JSON.stringify(playlistData, null, 2),
          contentType: 'application/json',
        },
      ],
    };

    try {
      const info = await this._transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);

      // Untuk Ethereal/Mailtrap, tampilkan URL preview
      if (info.messageId && info.envelope) {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return info;
    } catch (error) {
      console.error('Error sending email:', error.message);
      throw error;
    }
  }

  async consumeMessages() {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
      const channel = await connection.createChannel();

      await channel.assertQueue('export:playlist', { durable: true });

      console.log('Consumer is waiting for messages...');

      channel.consume('export:playlist', async (msg) => {
        if (msg !== null) {
          try {
            const { playlistId, targetEmail } = JSON.parse(
              msg.content.toString(),
            );
            console.log(
              `Processing export for playlist ${playlistId} to ${targetEmail}`,
            );

            const playlistData = await this.getPlaylistData(playlistId);
            await this.sendEmail(targetEmail, playlistData);

            channel.ack(msg);
            console.log('Export completed successfully');
          } catch (error) {
            console.error('Error processing message:', error.message);
            channel.nack(msg, false, false);
          }
        }
      });
    } catch (error) {
      console.error('RabbitMQ connection error:', error.message);
    }
  }

  async start() {
    console.log('Starting playlist export consumer...');
    await this.consumeMessages();
  }
}

const exporter = new PlaylistExporter();
exporter.start().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
