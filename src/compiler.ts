const fs = require('fs');
const glob = require('glob');
const rimraf = require('rimraf');
const sass = require('node-sass');

declare var compiler : Compiler;

class Compiler
{
    public run(sourceCode:string) : Promise<string>
    {
        return new Promise((resolve, reject) => {
            (async () => {
                try
                {
                    const timestamp = Date.now();
                    await this.makeDirectory(timestamp);
                    await this.cloneBaseCode(timestamp);
                    await this.createSourceCodeFile(timestamp, sourceCode);
                    await this.renderCss(timestamp);
                    await this.cleanup(timestamp);
                    resolve(timestamp.toString());
                }
                catch (error)
                {
                    reject(error);
                }
            })();
        });
    }

    private renderCss(timestamp:number)
    {
        return new Promise((resolve, reject) => {
            const pathToMain = `${ __dirname }/temp/${ timestamp }/main.scss`;
            const destPath = `${ __dirname }/temp/${ timestamp }/main.css`;

            sass.render(
                {
                    file: pathToMain,
                    outputStyle: 'compressed'
                },
                (error, result) => {
                    if (error)
                    {
                        reject(`${ error.message } at line ${ error.line } ${ error.file }`);
                    }

                    if (result === null || result.css === null)
                    {
                        reject(`Failed to render`);
                    }

                    try
                    {
                        fs.writeFile(destPath, result.css.toString(), (error) => {
                            if (error)
                            {
                                reject(error);
                            }
    
                            resolve();
                        });
                    }
                    catch (error)
                    {
                        reject(error);
                    }
                }
            );
        });
    }

    private createSourceCodeFile(timestamp:number, sourceCode:string)
    {
        return new Promise((resolve, reject) => {
            fs.writeFile(`${ __dirname }/temp/${ timestamp }/_config.scss`, sourceCode, (error) => {
                if (error)
                {
                    reject(error);
                }

                resolve();
            });
        });
    }

    private cloneBaseCode(timestamp:number)
    {
        return new Promise((resolve, reject) => {
            fs.copyFile(__dirname + '/../base/main.scss', `${ __dirname }/temp/${ timestamp }/main.scss`, (error) => {
                if (error)
                {
                    reject(error);
                }

                fs.copyFile(__dirname + '/../base/_base.scss', `${ __dirname }/temp/${ timestamp }/_base.scss`, (error) => {
                    if (error)
                    {
                        reject(error);
                    }

                    fs.copyFile(__dirname + '/../base/_content.scss', `${ __dirname }/temp/${ timestamp }/_content.scss`, (error) => {
                        if (error)
                        {
                            reject(error);
                        }

                        resolve();
                    });
                });
            });
        });
    }

    private cleanup(timestamp:number)
    {
        return new Promise((resolve, reject) => {
            fs.promises.access(`${ __dirname }/temp`)
            .then(() => {
                glob(`${ __dirname }/temp/*/`, (error, directories) => {
                    if (error)
                    {
                        reject(error);
                    }
    
                    let removed = 0;
                    if (directories.length)
                    {
                        for (let i = 0; i < directories.length; i++)
                        {
                            const directoryPath = directories[i].replace(/(build\/temp\/)|[\/]$/g, '').trim();

                            if (directoryPath.length)
                            {
                                if (directoryPath !== timestamp.toString())
                                {
                                    rimraf(`${ __dirname }/temp/${ directoryPath }`, (error) => {
                                        if (error)
                                        {
                                            reject(error);
                                        }

                                        removed++;
                                        if (removed === directories.length)
                                        {
                                            resolve();
                                        }
                                    });
                                }
                                else
                                {
                                    removed++;
                                    if (removed === directories.length)
                                    {
                                        resolve();
                                    }
                                }
                            }
                            else
                            {
                                removed++;
                                if (removed === directories.length)
                                {
                                    resolve();
                                }
                            }
                        }
                    }
                    else
                    {
                        resolve();
                    }
                });
            })
            .catch(() => { resolve(); });
        });
    }

    private makeDirectory(timestamp:number)
    {
        return new Promise((resolve, reject) => {
            fs.mkdir(`${ __dirname }/temp/${timestamp}`, { recursive: true }, (error) => {
                if (error) {
                    reject(error);
                }
                resolve();
            });
        });
    }
}

// @ts-ignore
self.compiler = new Compiler();