# Changelog

## 1.1
### settings file
Some settings must be changed to meet Kilos requirements:
Remove ROOT_PATH constant. Add the following line instead

			QS_PATH = os.path.dirname(os.path.abspath(__file__))

Change

			TEMPLATE_DIRS = (
            os.path.join(ROOT_PATH, 'templates'), # taken from the openstack_dashboard settings
            normpath(join(SITE_ROOT, 'openstack_dashboard/dashboards/src/sw-openstack-quickstart/quickstart/instances/templates')),
        )

to

			TEMPLATE_DIRS = (
    os.path.join(QS_PATH, 'templates'), # taken from the openstack_dashboard settings
    # normpath(join(SITE_ROOT, 'openstack_dashboard/dashboards/quickstart/instances/templates')),
    '/opt/stack/horizon/src/sw-openstack-quickstart/quickstart/instances/templates'
)

## 1.2

* Change angular module imports
* Use native methods in API

## 1.3

* Use Font Awesome instead of Glyphicons to support Newton

### Angular update

The easiest way to update the JS dependencies is to remove the node_modules folder and run:

		npm install

from the main directory.

### API Client (hz.api)

The current version still uses the kilo backport as the Angular code for kilo has a [bug](https://ask.openstack.org/en/question/81819/launch_instance_ng_enabled-error-in-dashboard/)

In order to use the Kilo hz.api client, all api files can be commented out in grunt.js

## 1.3.3

* Add os_flavor_name to meta data

## 1.3.4

* Show instance name when deleting an instance

## 1.3.5

* Use different colored bulbs for different kind of messages

## 1.3.6

* Add required to instance name

## 1.4

* Add automatic security group selection where possible
* Release floating IP when machine is deleted
* Remove automatic network if no VM is connected to it
* Add new VMs to private network
* Create IPv6 rules
* Refactor main form
* Update lodash to v4
