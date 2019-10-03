class BaseConfigButtonComponent extends HTMLElement
{
    private _configFileUrl : string|null;
    private _downloadEl : HTMLAnchorElement|null;

    constructor()
    {
        super();
        this._configFileUrl = null;
    }

    private handleClickEvent:EventListener = this.triggerCleanConfigDownload.bind(this);

    private async fetchConfigFile()
    {
        const request = await fetch(__dirname + '/../base/_config.scss');
        if (request.ok)
        {
            const response = await request.blob();
            this._configFileUrl = URL.createObjectURL(response);
            this._downloadEl = document.createElement('a');
            this._downloadEl.href = this._configFileUrl;
            this._downloadEl.download = 'config.scss';
            return;
        }
        else
        {
            throw `Failed to fetch base config file ${ request.status }: ${ request.statusText }`;
        }
    }

    public triggerCleanConfigDownload() : void
    {
        if (!this._configFileUrl || !this._downloadEl)
        {
            this.fetchConfigFile()
            .then(() => {
                if (!this._downloadEl)
                {
                    throw 'If you\'re seeing this, the code is in what I thought was an unreachable state. Anything is possible. The limits where in our heads all along. Follow your dreams.'
                }

                this._downloadEl.click();
            })
            .catch(error => {
                console.error(error);
            });
        }
        else
        {
            this._downloadEl.click();
        }
    }

    connectedCallback()
    {
        this.addEventListener('click', this.handleClickEvent);
    }
}
customElements.define('base-config-button-component', BaseConfigButtonComponent);