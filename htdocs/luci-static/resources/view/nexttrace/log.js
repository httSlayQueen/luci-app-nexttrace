'use strict';
'require view';
'require uci';
'require fs';
'require poll';

const CSS = '   \
#log-viewer {    \
    height: 600px;  \
    font-weight: 100;   \
    overflow: auto;  \
    white-space: pre;    \
    display: block; \
    word-wrap: normal;  \
    background: #1e1e1e; \
    color: #e8e8e8;\
}   \
';
const LOGFILE = '/tmp/log/nexttrace.log';
const REGEX_REMOVE_COLOR = /\x1B\[[0-9;]*[A-Za-z]/g;

async function readLogFile() {
    try {
        const res = await fs.read_direct(`${LOGFILE}`,'text');
        this.textContent = res.replace(REGEX_REMOVE_COLOR, '').trim() || _('[Dooh! Empty Log File]');
    } catch (e) {
        this.textContent = _('[Dooh! Log File Not Found]');
    }
    
}

return view.extend({
    handleSaveApply: null,
	handleSave: null,
	handleReset: null,

    load: function() {
		return Promise.all([
			uci.load('luci-nexttrace')
		]);
	},

    render: function(data) {
        let s = uci.sections('status');
        let body, logViewer;

        body = E([
            E('div', { 'style':'text-align:right' }, 
                E('small', {}, _('Refresh every %s seconds.').format(L.env.pollinterval))
            ),
            E('div'),
            E('style', [CSS])
        ]);

        logViewer = E('pre', { id: 'log-viewer' }, []);
        logViewer.textContent = '';

        poll.add(L.bind(readLogFile, logViewer));

        body.appendChild(logViewer);
        return body;
    },
});