const { runScript } = require("../../scriptWrapper");
const logger = require("../../../common/logger");
const { jobNames } = require("../../../common/model/constants");
const { purgeUserEvents } = require("./purgeUserEvents");
const { purgeJobEvents } = require("./purgeJobEvents");

const { subDays } = require("date-fns");

const NB_DAYS_TO_KEEP = 15;

/**
 * Ce script permet d'executer un job de purge des données inutiles
 */
runScript(async () => {
  const lastDateToKeep = subDays(new Date(), NB_DAYS_TO_KEEP);

  logger.info(`Running Purging Job for data older than ${lastDateToKeep} ...`);
  await purgeUserEvents(lastDateToKeep);
  await purgeJobEvents(lastDateToKeep);
  logger.info("End Purging Job");
}, jobNames.cfasRetrieveDataConnection);
