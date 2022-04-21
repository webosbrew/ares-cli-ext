#!/usr/bin/env node

var path = require("path"),
    log = require("npmlog"),
    nopt = require("nopt"),
    launchLib = require("@webosose/ares-cli/lib/launch"),
    commonTools = require("@webosose/ares-cli/lib/base/common-tools"),
    version = commonTools.version,
    cliControl = commonTools.cliControl,
    help = commonTools.help,
    setupDevice = commonTools.setupDevice,
    appdata = commonTools.appdata,
    processName = path.basename(process.argv[1], ".js");


/**********************************************************************/

process.on('uncaughtException', function (err) {
    log.error('uncaughtException', err.toString());
    cliControl.end(-1);
});

var knownOpts = {
    device: [String, null],
    "device-list": Boolean,
    version: Boolean,
    help: Boolean,
    "hidden-help": Boolean,
    "level":	['silly', 'verbose', 'info', 'http', 'warn', 'error']
};

var shortHands = {
    d: ["--device"],
    D: ["--device-list"],
    V: ["--version"],
    h: ["--help"],
    hh: ["--hidden-help"],
    v: ["--level", "verbose"],
};

var argv = nopt(knownOpts, shortHands, process.argv, 2);


/**********************************************************************/

log.heading = processName;
log.level = argv.level || 'warn';
launchLib.log.level = log.level;


/**********************************************************************/

if (argv.help) {
    showUsage();
    cliControl.end();
}

log.verbose("argv", argv);

var options = {device: argv.device},
    params = {extend: !0},
    appId = "com.palmdts.devmode";

if (argv['version']) {
    version.showVersionAndExit();
} else if (argv['hidden-help']) {
    showUsage(argv["hidden-help"]);
    cliControl.end();
} else if (argv['device-list']) {
    deviceTools.showDeviceListAndExit();
} else {
    op = extend;
}

/**********************************************************************/

if (op) {
    version.checkNodeVersion(function(err) {
        op(finish);
    });
}


function showUsage() {

}

function extend() {
    log.info("extend():", "appId:", appId, "/params:", params);
    launchLib.launch(options, appId, params, finish);
}

function finish(err, value) {
    if (err) {
        var msg = err.toString();
        if (msg.includes("not exist") || msg.includes("not found")) {
            msg = "Failed to launch 'Developer Mode' app. Please check the app is installed.";
        }
        log.error(msg);
        log.verbose(err.stack);
        cliControl.end(-1);
    } else {
        if (value && value.msg) {
            console.log("Launched 'Developer Mode' app.\nPlease check the 'Remain Session' through the device screen.\n");
        }
        cliControl.end();
    }
}
