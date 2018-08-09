# -*- coding: utf-8 -*-
#
# Iterativ GmbH
# http://www.iterativ.ch/
#
# Copyright (c) 2015 Iterativ GmbH. All rights reserved.
#
# Created on 02/06/15
# @author: pawel
import os
from fabric.tasks import Task
from fabric.api import env


class EnvTask(Task):

    def __init__(self, *args, **kwargs):
        super(EnvTask, self).__init__(*args, **kwargs)
        # monkey patch run task to execute env calculations
        self.__run = self.run
        self.run = self._run_wrapper
        env.use_ssh_config = True
        # set env variables
        env.rsync_exclude = ['settings_local.py', 'settings_local.example.py', '.svn/', '.git/', '.hg/',
                             'runserver.sh', 'CACHE/', '.keep', '*.pyc', '*.log', '*.db', '*.dat']
        # path config
        env.remote_base_path = '/opt/stack/horizon'
        env.openstack_dashboard = 'openstack_dashboard'
        env.settings_subpath = '%s/local' % env.openstack_dashboard
        env.dashboard_path_template = '%(remote_base_path)s/%(openstack_dashboard)s/dashboards'
        env.dashboard_config_path_template = '%(remote_base_path)s/%(openstack_dashboard)s/enabled'

    def dynamic_env(self):
        # base local path
        env.local_path = lambda *args: os.path.join(os.path.abspath(os.getcwd()), '..', *args)
        # base remote paths
        env.remote_path = lambda *args: os.path.join(env.remote_base_path, *args)
        env.dashboard_path = lambda *args: os.path.join(env.dashboard_path_template % {
            'remote_base_path': env.remote_base_path,
            'openstack_dashboard': env.openstack_dashboard
        }, *args)
        env.dashboard_config_path = lambda *args: os.path.join(env.dashboard_config_path_template % {
            'remote_base_path': env.remote_base_path,
            'openstack_dashboard': env.openstack_dashboard
        }, *args)

        # remote paths
        env.remote_frontend = env.dashboard_path('quickstart')
        env.remote_backend = env.dashboard_path()
        env.remote_settings = env.remote_path(env.settings_subpath)
        # local paths
        # TODO: we have the built and the raw frontend to choose from
        env.local_frontend = env.local_path(env.project_name, 'static')
        env.local_backend = env.local_path(env.project_name)
        env.local_settings = env.local_path(env.project_name, 'settings')

    def _run_wrapper(self):
        self.__run()
        self.dynamic_env()
