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


class PawelEnv(EnvTask):
    """
    Use pawel environment
    """
    name = "pawel"

    def run(self):
        #env.hosts = ['86.119.35.221']  # this is the remote stack on stack
        env.hosts = ['192.168.57.134']  # local devstack
        env.user = 'pawel'
        env.project_name = 'quickstart'
        env.settings_file = 'pawel.py'
        env.settings_module = 'quickstart.settings.pawel'
        env.dashboard_name = 'quickstart'
        env.dashboard_config_name = '_10_quickstart.py'


pawel_env = PawelEnv()