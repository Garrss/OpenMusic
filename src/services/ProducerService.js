const amqp = require('amqplib');

class ProducerService {
  async sendMessage(queue, message) {
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: true, // Queue akan survive jika RabbitMQ restart
    });

    await channel.sendToQueue(queue, Buffer.from(message));

    console.log(`Message sent to queue ${queue}: ${message}`);

    setTimeout(() => {
      connection.close();
    }, 500);
  }
}

module.exports = ProducerService;
