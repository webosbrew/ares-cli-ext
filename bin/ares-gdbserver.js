#!/usr/bin/env node

var fs = require('fs'),
    path = require("path"),
    async = require('async'),
    log = require('npmlog'),
    nopt = require('nopt'),
    _gdbserver = require('../lib/gdbserver'),
    cliControl = require('@webosose/ares-cli/lib/base/cli-control'),
    version = require('@webosose/ares-cli/lib/base/version-tools'),
    help = require('@webosose/ares-cli/lib/base/help-format'),
    novacom = require('@webosose/ares-cli/lib/base/novacom'),
    deviceTools = require('@webosose/ares-cli/lib/base/setup-device'),
    commonTools = require("@webosose/ares-cli/lib/base/common-tools"),
    version = commonTools.version,
    cliControl = commonTools.cliControl,
    help = commonTools.help,
    appdata = commonTools.appdata;

/**********************************************************************/

var processName = path.basename(process.argv[1]).replace(/.js/, '');

process.on('uncaughtException', function (err) {
    log.error('uncaughtException', err.toString());
    cliControl.end(-1);
});

if (process.argv.length === 2) {
    process.argv.splice(2, 0, '--help');
}

/**********************************************************************/

var knownOpts = {
    "device": [String, null],
    "port": [String, null],
    "close": Boolean,
    "app": [String, null],
    "service": [String, null],
    "device-list": Boolean,
    "version": Boolean,
    "help": Boolean,
    "level": ['silly', 'verbose', 'info', 'http', 'warn', 'error']
};
var shortHands = {
    "d": ["--device"],
    "p": ["--port"],
    "c": ["--close"],
    "a": ["--app"],
    "s": ["--service"],
    "D": ["--device-list"],
    "V": ["--version"],
    "h": ["--help"],
    "v": ["--level", "verbose"]
};

var argv = nopt(knownOpts, shortHands, process.argv, 2 /*drop 'node' & 'ares-inspect.js'*/);

/**********************************************************************/

log.heading = processName;
log.level = argv.level || 'warn';


/**********************************************************************/

if (argv.help) {
    showUsage();
    cliControl.end();
}

log.verbose("argv", argv);

var op;

if (argv['version']) {
    version.showVersionAndExit();
} else if (argv['device-list']) {
    deviceTools.showDeviceListAndExit();
} else if (argv['close']) {
    op = close;
} else {
    op = gdbserver;
}

var options = {
    device: argv.device,
    appId: argv.app || argv.argv.remain[0],
    serviceId: argv.service,
    port: argv.port
};

/**********************************************************************/

if (op) {
    version.checkNodeVersion(function (err) {
        op(finish);
    });
}

function showUsage() {
    help.display('../../../../../../@webosbrew/ares-cli-ext/files/help/' + processName,
        appdata.getConfig(true).profile);
}

function gdbserver() {
    log.info("gdbserver():", "AppId:", options.appId);
    if (!options.appId && !options.serviceId) {
        showUsage();
        cliControl.end(-1);
    }
    _gdbserver.run(options, null, finish);
}

function close() {
    log.info("gdbserver():", "close");
    if (!options.device) {
        showUsage();
        cliControl.end(-1);
    }
    _gdbserver.close(options, null, finish);
}

function finish(err, value) {
    if (err) {
        log.error(processName + ": " + err.toString());
        log.verbose(err.stack);
        cliControl.end(-1);
    } else {
        if (value && value.msg) {
            console.log(value.msg);
        }
        cliControl.end();
    }
}

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});
