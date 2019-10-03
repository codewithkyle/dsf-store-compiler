const fs = require('fs');
const glob = require('glob');
const sass = require('node-sass');

class CustomCompiler
{
    constructor()
    {
        this.run();
    }

    async run()
    {
        try
        {
            /** HTML */
            const htmlFiles = await this.getHtmlFiles();
            if (htmlFiles.length === 0)
            {
                throw "Couldn't find any HTML files in the src/ directory";
            }
            await this.buildHtmlDirectories(htmlFiles);
            await this.cloneHtmlFiles(htmlFiles);

            /** SASS */
            const sassFiles = await this.getSassFiles();
            if (sassFiles.length === 0)
            {
                throw "Couldn't find any SCSS files in the src/ directory";
            }
            await this.buildScssDirectory();
            await this.renderCss(sassFiles);

            console.log('Success!');
        }
        catch (error)
        {
            console.log(error);
        }
    }

    renderCss(files)
    {
        return new Promise((resolve, reject) => {
            let rendered = 0;
            for (let i = 0; i < files.length; i++)
            {
                const sourcePath = files[i];
                const destPath = sourcePath.replace('src', 'build/stylesheets').replace(/(scss)$/, 'css').trim().toLowerCase();

                sass.render(
                    {
                        file: sourcePath,
                        outputStyle: 'compressed'
                    },
                    (error, result) => {
                        if (error)
                        {
                            reject(`\n\n${ error.message } at line ${ error.line } ${ error.file }\n\n`);
                        }

                        if (result === null)
                        {
                            reject(`\n\n${ sourcePath } failed to render\n\n`);
                        }

                        fs.writeFile(destPath, result.css.toString(), (error) => {
                            if (error)
                            {
                                reject(error);
                            }

                            rendered++;
                            if (rendered === files.length)
                            {
                                resolve();
                            }
                        });
                    }
                );
            }
        });
    }

    buildScssDirectory()
    {
        return new Promise((resolve, reject) => {
            fs.mkdir('build/stylesheets', (error) => {
                if (error)
                {
                    reject(error);
                }

                resolve();
            });
        });
    }

    getSassFiles()
    {
        return new Promise((resolve, reject) => {
            glob('src/**/*.scss', (error, files) => {
                if (error)
                {
                    reject(error);
                }

                resolve(files);
            });
        });
    }

    buildHtmlDirectories(files)
    {
        return new Promise((resolve, reject) => {
            let built = 0;
            for (let i = 0; i < files.length; i++)
            {
                const fullPath = files[i];
                console.log(fullPath);
                const cleanPathname = fullPath.replace(/(src\/)|(index\.html)/g, '').replace(/[\/]$/, '').trim().toLowerCase();
                console.log(cleanPathname);

                if (cleanPathname.length)
                {
                    fs.mkdir(`build/${ cleanPathname }`, { recursive: true }, (error) => {
                        if (error)
                        {
                            reject(error);
                        }
    
                        built++;
                        if (built === files.length)
                        {
                            resolve();
                        }
                    });
                }
                else
                {
                    built++;
                    if (built === files.length)
                    {
                        resolve();
                    }
                }
            }
        });
    }

    cloneHtmlFiles(files)
    {
        return new Promise((resolve, reject) => {
            let moved = 0;
            for (let i = 0; i < files.length; i++)
            {
                const fullPath = files[i];
                const cleanPathname = fullPath.replace(/(src\/)|(index\.html)/g, '').replace(/[\/]$/, '').trim().toLowerCase();

                fs.copyFile(fullPath, `build/${ cleanPathname }${ (cleanPathname.length) ? '/' : '' }index.html`, (error) => {
                    if (error)
                    {
                        reject(error);
                    }

                    moved++;
                    if (moved === files.length)
                    {
                        resolve();
                    }
                });
            }
        });
    }

    getHtmlFiles()
    {
        return new Promise((resolve, reject) => {
            glob('src/**/*.html', (error, files) => {
                if (error)
                {
                    reject(error);
                }

                resolve(files);
            });
        });
    }
}

new CustomCompiler();