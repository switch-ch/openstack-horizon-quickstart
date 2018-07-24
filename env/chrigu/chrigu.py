# -*- coding: utf-8 -*-
#
# Iterativ GmbH
# http://www.iterativ.ch/
#
# Copyright (c) 2015 Iterativ GmbH. All rights reserved.
#
# Created on 02/06/15
# @author: pawel
from fabric.api import env
from base.base import EnvTask


class ChriguEnv(EnvTask):
    """
    Use chrigu environment
    """
    name = "chrigu"

    def run(self):
        env.hosts = ['10.0.0.4']
        env.user = 'chrigu'
        # env.hosts = ['86.119.35.78']
        # env.user = 'ubuntu'
        env.project_name = 'quickstart'
        env.settings_file = 'chrigu.py'
        env.settings_module = 'quickstart.settings.chrigu'
        env.dashboard_name = 'quickstart'
        env.dashboard_config_name = '_10_quickstart.py'


chrigu_env = ChriguEnv()