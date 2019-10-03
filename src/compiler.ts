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
            const pathToMain = `build/temp/${ timestamp }/main.scss`;
            const destPath = `build/temp/${ timestamp }/main.css`;

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

                    if (result === null)
                    {
                        reject(`Failed to render`);
                    }

                    fs.writeFile(destPath, result.css.toString(), (error) => {
                        if (error)
                        {
                            reject(error);
                        }

                        resolve();
                    });
                }
            );
        });
    }

    private createSourceCodeFile(timestamp:number, sourceCode:string)
    {
        return new Promise((resolve, reject) => {
            fs.writeFile(`build/temp/${ timestamp }/_config.scss`, sourceCode, (error) => {
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
            fs.copyFile('base/main.scss', `build/temp/${ timestamp }/main.scss`, (error) => {
                if (error)
                {
                    reject(error);
                }

                fs.copyFile('base/_base.scss', `build/temp/${ timestamp }/_base.scss`, (error) => {
                    if (error)
                    {
                        reject(error);
                    }

                    fs.copyFile('base/_content.scss', `build/temp/${ timestamp }/_content.scss`, (error) => {
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
            fs.promises.access('build/temp')
            .then(() => {
                glob('build/temp/*/', (error, directories) => {
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
                                    rimraf(`build/temp/${ directoryPath }`, (error) => {
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
            fs.mkdir(`build/temp/${ timestamp }`, { recursive: true }, (error) => {
                if (error)
                {
                    reject(error);
                }

                resolve();
            });
        });
    }
}

// @ts-ignore
self.compiler = new Compiler();