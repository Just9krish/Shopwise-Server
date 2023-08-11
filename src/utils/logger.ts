import pino from "pino";
import dayjs from "dayjs";

// const log = pino({
//   prettyPrint: true,
//   base: {
//     pid: false,
//   },
//   timeStamp: () => `,"time":${dayjs().format()}`,
// });

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: true,
    },
  },
});

export default logger;
