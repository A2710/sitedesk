import { Kafka } from "kafkajs";

// Read from env, fallback for dev/local
const kafkaBroker = process.env.KAFKA_BROKER || "localhost:9092";
const kafkaClientId = process.env.KAFKA_CLIENT_ID || "sitedesk-app";

export const kafka = new Kafka({
  clientId: kafkaClientId,
  brokers: [kafkaBroker],
});

// Export singleton producer (connect in app bootstrap)
export const kafkaProducer = kafka.producer();

// Export consumer factory (each worker should have its own groupId)
export const kafkaConsumer = (groupId: string) =>
  kafka.consumer({ groupId });
