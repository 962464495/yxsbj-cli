const inquirer = require('inquirer');
const path = require("path");
const fs = require('fs-extra');
const chalk = require("chalk");
const boxen = require('boxen');
const ora = require('ora');
const rm = require('rimraf').sync
const updateNotifier = require('update-notifier');
const download = require('download-git-repo');

const BOXEN_OPTS = {
    padding: 1,
    margin: 1,
    align: 'center',
    borderColor: '#678491',
    borderStyle: 'round'
};
const GIT_BASE = 'https://github.com/';
const REACT_TPL = '962464495/yinxiangshu_cli';

class CliUtil {
    constructor(program, opts) {

        this.program = program;
        this.opts = opts;
    }

    initializing(pkg) {
        const messages = [];
        messages.push(
            `🔥  欢迎使用 yxsbj-cli ${chalk.grey(`v${pkg.version}`)}`
        );
        messages.push(
            chalk.grey('https://github.com/962464495')
        );
        messages.push(
            chalk.grey('https://www.npmjs.com/package/a962464495')
        )
        console.log(boxen(messages.join('\n'), BOXEN_OPTS));
        this.checkVersion(pkg)
    }

    checkVersion(pkg) {
        console.log();
        console.log('🛠️  正在检查您的yxsbj-cli版本...');

        let checkResult = false;
        const notifier = updateNotifier({
            pkg,
            updateCheckInterval: 0
        });

        const update = notifier.update;
        if (update) {
            const messages = [];
            messages.push(`可执行更新 ${chalk.grey(update.current)} → ${chalk.green(update.latest)}`)
            messages.push(`运行 ${chalk.cyan(`npm i -g ${pkg.name}`)} 来进行更新`)
            console.log(boxen(messages.join('\n'), { ...BOXEN_OPTS, borderColor: '#fae191' }));
            console.log('🛠️  检查您的yxsbj-cli版本完毕! 警告 ↑↑', '⚠️');
        }
        else {
            checkResult = true;
            console.log('🛠️  检查您的yxsbj-cli版本完毕!. OK', chalk.green('✔'));
        }
        return checkResult;
    }

    checkAppName(appName) {
        const to = path.resolve(appName); // 获取绝对路径
        if (appName === '.') {
            this.checkEmpty(to)
        } else if (this.checkExist(to)) {
            inquirer.prompt([{
                type: 'confirm',
                message: '目标目录已经存在,是否继续?',
                name: 'ok',
            }]).then(answers => {
                if (answers.ok) {
                    this.downloadAndGenerate(REACT_TPL, to, appName)
                }
            })
        } else {
            this.downloadAndGenerate(REACT_TPL, to, appName)
        }
    }

    checkExist(path) {
        return fs.pathExistsSync(path);
    }

    checkEmpty(path, appName) {
        const dirFiles = fs.readdirSync(path);
        if (dirFiles.length > 0) {
            inquirer.prompt([{
                type: 'confirm',
                name: 'ok',
                message: '目标目录中存在内容,将被覆盖.是否继续?',
            }]).then(answers => {
                if (answers.ok) {
                    this.downloadAndGenerate(REACT_TPL, path, appName)
                }
            })
        }
    }

    downloadAndGenerate(template, to, appName) {
        const spinner = ora(`从 ${GIT_BASE}${template} 下载模板`);
        spinner.start();
        // Remove if local template exists
        if (!appName) fs.emptyDirSync(to);
        else if (this.checkExist(to) && appName) rm(appName);
        this.download(template, to)
            .then(() => {
                console.log(process.cwd())
                fs.readFile(`${process.cwd()}/${appName}/package.json`, (err, data) => {
                    if (err) throw err;
                    let _data = JSON.parse(data.toString())
                    _data.name = appName
                    _data.version = '1.0.0'
                    let str = JSON.stringify(_data, null, 4);
                    fs.writeFile(`${process.cwd()}/${appName}/package.json`, str, function (err) {
                        if (err) throw err;
                    })
                });
                spinner.stop();
                console.log('🌟  完成创建一个新的模板项目! OK', chalk.green('✔'));
                console.log();
                console.log(`运行:\n\n  ${appName ? `cd ${appName}\n  ` : ''}npm install\n  npm run dev`);
                console.log();
            })
            .catch((err) => {
                spinner.stop();
                console.log();
                console.error(
                    chalk.red(
                        "下载模板失败! " + template + ": " + err.message.trim()
                    )
                );
                process.exit(1)
            })
    }

    download(template, to) {
        return new Promise((resolve, reject) => {
            const clone = this.program.clone || false;
            download(template, to, { clone }, err => err ? reject(err) : resolve());
        });
    }
}

module.exports = CliUtil;