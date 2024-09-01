"""! @brief utils functions for running model and parsing request parameters from API"""

import os
import logging
import datetime

LOGGING_FORMATTER = logging.Formatter(
    '[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s')
PRINT_LOGGING_HANDLER = logging.StreamHandler()
PRINT_LOGGING_HANDLER.setFormatter(LOGGING_FORMATTER)


def get_logger(logger_name, print_in_screen=True):
    logger = logging.getLogger(logger_name)
    folder_to_log = os.path.join(
        os.path.dirname(__file__), '../../logs/{}/'.format(logger_name))
    if not os.path.exists(folder_to_log):
        os.makedirs(folder_to_log)
    DEFAULT_LOGGING_HANDLER = logging.FileHandler(os.path.join(folder_to_log, '{}_{}.log'.format(
        logger_name,
        datetime.datetime.strftime(datetime.datetime.now(), '%Y-%m-%d'))))
    DEFAULT_LOGGING_HANDLER.setFormatter(LOGGING_FORMATTER)
    logger.addHandler(DEFAULT_LOGGING_HANDLER)
    if print_in_screen:
        logger.addHandler(PRINT_LOGGING_HANDLER)
    logger.setLevel(logging.DEBUG)
    return logger
