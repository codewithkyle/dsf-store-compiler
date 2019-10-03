class CompilerButtonComponent extends HTMLElement
{
    private _text : HTMLSpanElement|null;
    private _downloadEl : HTMLAnchorElement|null;

    constructor()
    {
        super();
        this._text = this.querySelector('span');
        this._downloadEl = null;
    }

    private handleClickEvent:EventListener = this.runCompiler;
    private handleStateChangeEvent:any = this.manageState.bind(this);

    private manageState(e:CustomEvent) : void
    {
        let newLabel;

        switch (e.detail.status)
        {
            case 'failed':
                newLabel = 'Failed';
                break;
            case 'running':
                newLabel = 'Running';
                break;
            case 'completed':
                newLabel = 'Download';
                break;
            default:
                newLabel = 'Run';
                break;
        }

        this.updateLabel(newLabel);
    }

    private runCompiler() : void
    {
        if (stateManager.state.compilerStatus === 'completed' && this._downloadEl)
        {
            this._downloadEl.click();
        }
        else
        {
            stateManager.compile();
            
            if (this._downloadEl)
            {
                URL.revokeObjectURL(this._downloadEl.href);
            }

            this._downloadEl = null;
        }
    }

    connectedCallback()
    {
        this.addEventListener('click', this.handleClickEvent);
        self.addEventListener('state-change', this.handleStateChangeEvent);
    }

    public addLink(url:string) : void
    {
        this._downloadEl = document.createElement('a');
        this._downloadEl.href = url;
        this._downloadEl.download = 'main.css';
    }

    public updateLabel(newLabel:string = 'Run') : void
    {
        if (!this._text)
        {
            return;
        }

        this._text.innerText = newLabel;
    }
}
customElements.define('compiler-button-component', CompilerButtonComponent);