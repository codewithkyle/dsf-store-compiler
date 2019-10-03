class CodeInputManager
{
    private static emptyTextareaMessage:string = 'Paste webstore config to begin';

    private _input : HTMLTextAreaElement|null;

    constructor()
    {
        this._input = document.body.querySelector('#code-input');

        this.init();
    }

    private handleInputFocusEvent:EventListener = this.clearInput.bind(this);
    private handleInputBlurEvent:EventListener = this.checkInput.bind(this);
    private handleInputKeyEvent:EventListener = this.updateState.bind(this);

    private clearInput() : void
    {
        if (!this._input)
        {
            return;
        }

        if (this._input.value === CodeInputManager.emptyTextareaMessage)
        {
            this._input.value = '';
        }
    }

    private checkInput() : void
    {
        if (!this._input)
        {
            return;
        }

        if (this._input.value === '')
        {
            this._input.value = CodeInputManager.emptyTextareaMessage;
        }
    }

    private updateState() : void
    {
        if (!this._input)
        {
            return;
        }

        stateManager.updateSourceCode(this._input.value);
    }

    private init() : void
    {
        if (!this._input)
        {
            return;
        }

        this._input.addEventListener('focus', this.handleInputFocusEvent);
        this._input.addEventListener('blur', this.handleInputBlurEvent);
        this._input.addEventListener('keyup', this.handleInputKeyEvent);
    }
}
new CodeInputManager();