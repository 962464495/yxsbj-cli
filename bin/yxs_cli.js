#!/usr/bin/env node

// Commander是一个轻量级，富有表现力，以及用于强大的命令行框架的node.js

// 指定从PATH环境变量中来查找node解释器的位置，因此只要环境变量中存在，该脚本即可执行

const program = require('commander');
const inquirer = require('inquirer');
const chalk = require("chalk");
const pkg = require('../package.json');
const CliUtil = require('../lib/util.js');
const util = new CliUtil(program);

if (process.argv.slice(2).join('') === '-v') {
  console.log(`印相树(北京)科技有限公司 后台模板脚手架`);
  console.log(`          yxsbj-cli: ${pkg.version}  `);
  return;
}

program
  .version(pkg.version)
  .usage('<command> [options] <app-name> [folder-name]')
  .option("-c, --clone", "use git clone")
  .on("--help", () => {
    console.log();
    console.log("Examples:");
    console.log();
    console.log(
      chalk.gray("  # 从模板创建一个新的项目")
    );
    console.log("  $ yxs_cli create demo");
    console.log();
  });

program
  .command('setup')
  .description('运行设置命令')
  .action(function () {
    console.log('设置没有做 哈哈哈');
  });

program
  .command('create')
  .description('从模板来创建一个新项目')
  .action(function () {
    util.initializing(pkg);
    const appName = program.args[0];
    if (typeof appName === 'string') {
      util.checkAppName(appName);
    } else {
      const opts = [{
        type: 'input',
        name: 'appName',
        message: '请输入项目的名称：',
        validate: appName => {
          if (!appName) {
            return '⚠️  项目名称不能为空啊 喂！';
          }
          return true;
        }
      }];

      inquirer.prompt(opts).then(({ appName }) => {
        if (appName) {
          util.checkAppName(appName);
        }
      })
    }
  })


/**
 * error on unknown commands
 */
program.on('command:*', function () {
  console.error('无法解析的命令: %s\n', program.args.join(' '));
  program.help();
  process.exit(1);
});

function help() {
  program.parse(process.argv);  // 解析
  if (program.args.length < 1) return program.help();
}
help();