'use strict';
'require rpc';
'require view';
'require fs';
'require uci';
'require form';
'require ui';


function checkWebuiService() {
    const serviceList = rpc.declare({object:'service', method:'list', params:['name'], expect:{'':{}}});
    return L.resolveDefault(serviceList('nexttrace'), null).then(
        function(res) {
            try {
                return res['nexttrace']['instances']['luci-nexttrace']['running'];
            } catch (e) { }
            return false;
        }
    );
}

async function renderWebuiStatus() {
    const webuiStatus = await checkWebuiService();
    let element = E('text');

    element.style.color = 'red';
    element.textContent = _('Exited');
    if (webuiStatus) {
        element.style.color = 'green';
        element.textContent = _('Running');
    };

    return element;
}

async function renderWebuiBtn(section) {
    const webuiStatus = await checkWebuiService();
    let o;

    if (webuiStatus) {
        o = section.option(form.Button, '_webui', _('WebUI'));
        o.inputtitle = _('Open NextTrace WebUI');
        o.inputstyle = 'positive';
        o.onclick = function() {
            return openWebUI();
        };
    }

    return o;
}

async function openWebUI() {
    const addr = uci.get('luci-nexttrace', 'config', 'listen_addr');
    const [ip, port] = addr.split(":");
    let url = `http://${addr}`;

    if (ip == '0.0.0.0') {
        url = `${window.location.protocol}//${window.location.hostname}:${port}`;
    }

    setTimeout(function() {
        window.open(url);
    }, 0);

    return Promise.resolve();
}


return view.extend({
    load: function () {
        return Promise.all([
            L.resolveDefault(fs.exec('/usr/bin/nexttrace', ['-V']), null),
            uci.load('luci-nexttrace')
        ]);
    },

	render: function(data) {
        const regex = /v(\d+)\.(\d+)\.(\d+)/;
        const result = regex.exec(data[0].stdout);
        const version = result[0] ?? _('Unknow');
		let m, s, o;

		m = new form.Map('luci-nexttrace', _(''));

        s = m.section(form.TypedSection, 'status', _('Status'));
        s.anonymous = true;

        o = s.option(form.DummyValue, '_version', _('NextTrace'));
        o.readonly = true;
        o.load = function () {
            return version;
        };
        o.write = function () { };

        o = s.option(form.DummyValue, '_status', _('Service Status'));
        o.readonly = true;
        o.rawhtml = true;
        o.load = function () {
            return renderWebuiStatus();
        };
        o.write = function () { };

        o = renderWebuiBtn(s);

        s = m.section(form.TypedSection, 'config', _('Configure'));
        s.anonymous = true;

        o = s.option(form.Button, 'enabled', _('Service Switch'), 
            _('Stop the service after your works finished in WebUI, or it would request the PoW provider every second.')
        );
        o.rmempty = false;
        if ( o.load('config') == '1' ) {
            o.inputtitle = _('Stop');
            o.inputstyle = 'negative';
        } else {
            o.inputtitle = _('Start');
            o.inputstyle = 'positive';
        };
        o.onclick = L.bind(
            function() {
                o.readonly = true;
                this.write('config', (this.load('config') == '1')? '0' : '1');
                uci.save();
                ui.changes.apply();
            },
            o
        );

        o = s.option(form.Value, 'listen_addr', _('Address'));
        o.rmempty=false;
        o.placeholder = '0.0.0.0:1080';

        return m.render();
	},
});