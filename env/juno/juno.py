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


class JunoEnv(EnvTask):
    """
    Use juno environment
    """
    name = "juno"

    def run(self):
        env.hosts = ['86.119.35.78']
        env.user = 'ubuntu'
        env.project_name = 'quickstart'
        env.settings_file = 'juno.py'
        env.settings_module = 'quickstart.settings.juno'
        env.dashboard_name = 'quickstart'
        env.dashboard_config_name = '_10_quickstart.py'


juno_env = JunoEnv()