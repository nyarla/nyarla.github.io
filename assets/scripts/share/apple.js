(function (PHGAffiliateID) {
    var iTunesAPIEndpoint  = 'https://itunes.apple.com/lookup',
        iTunesLinkRe       = /^https:\/\/itunes\.apple\.com\/([a-z]+)\/([\w\-]+?)\/([\w\-\.]+)\/id(\d+)[?]mt=(\d+)(?:\u0026uo[=]\d+)?(?:\u0026at[=].+?)?[#](\w+)$/,
        TemplatePrefix     = 'itunes-template-',
        M                  = {
            'LOCALE':     1,
            'TYPE':       2,
            'NAME':       3,
            'ID':         4,
            'MT':         5,
            'FRAME':      6
        },
        MediaTypeMap      = {
            '1': 'album',
            '2': 'podcast',
            '3': 'audiobook',
            '4': 'tvShow',
            '5': 'musicVideo',
            '6': 'movie',
            '7': null,
            '8': 'software',
            '9': 'null',
            '10': 'null',
            '11': 'ebook',
            '12': 'software'
        },
        _CompiledTemplates = {}
    ;
        
    function _GetTemplate( frameType )  {
        return document.getElementById( TemplatePrefix + frameType ).textContent;
    }

    function _RenderTemplate( template, params ) {
        var compiled;

        if ( template in _CompiledTemplates ) {
            compiled = _CompiledTemplates[ template ];
        } else {
            compiled = _CompiledTemplates[template]  = Hogan.compile( _GetTemplate(template), { delimiters: '[% %]' } );
        }

        var dummy = document.createElement('div');
            dummy.innerHTML = compiled.render( params );

        return dummy;
    }

    function _BuildParams ( res ) {
        var item    = res['results'][0],
            title   = item['trackName']     || item['collectionName'],
            link    = item['trackViewUrl']  || item['collectionViewUrl'],
            price   = item['price']         || item['trackPrice'] || item['collectionPrice'] || '' ;

        if ( price != '' && price != '0' ) {
            price   = '\uFFE5' + price ;
        } else {
            price   = '\u7121\u6599';

        }

        return {
            title:          title,
            link:           link,
            affiliateLink:  ( link + '&at=' + PHGAffiliateID ),
            imageLink:      item['artworkUrl100'],
            publisher:      item['artistName'],
            price:          price
        };
    }

    var _genID  = 0;
    var _global = Function("return this")();

    function _BuildAPIParams( frame, locale, type, id) {
        _genID++;

        var callbackName = [ '__AppleLink', frame, _genID ].join('_');
        var requestURI   = iTunesAPIEndpoint + '?country=' + locale.toUpperCase() + '&entity=' + type + '&id=' + id + '&callback=' + callbackName;

        return {
            callback:   callbackName,
            requestURI: requestURI
        }
    }

    function _CalliTunesAPI( el ) {
        var href    = el.getAttribute('href');
        var capture = iTunesLinkRe.exec(href);

        var locale  = capture[ M['LOCALE']    ];
        var id      = capture[ M['ID']        ];
        var mt      = capture[ M['MT']        ];
        var frame   = capture[ M['FRAME']     ];
        var type    = capture[ M['TYPE']      ];
        
        var media;
        if ( mt != '' ) {
            media = MediaTypeMap[mt];
        } else {
            media = type;
        }

        var param = _BuildAPIParams( frame, locale, media, id );
        var callback = param['callback'];
        
        if ( ! ( callback in _global ) ) {
            _global[callback] = function ( res ) {
                el.parentNode.parentNode.replaceChild(
                    _RenderTemplate( frame, _BuildParams(res) ),
                    el.parentNode
                );
            };
        }

        var script = document.createElement('script');
            script.setAttribute('type', 'application/javascript');
            script.setAttribute('src',  param['requestURI']);
        
        document.head.appendChild(script);

        return;
    }

    function main() {
        var lst = document.querySelectorAll('p > a[href^="https://itunes.apple.com/"]:only-child');
        
        for ( var i = 0, len = lst.length; i < len; i++ ) {
            _CalliTunesAPI( lst[i] );
        }
    }
    
    document.addEventListener('DOMContentLoaded', main, false)
})('11l5Qs');

