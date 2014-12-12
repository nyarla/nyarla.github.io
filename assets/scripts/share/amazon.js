(function ( AssociateTag ) {
    var AIProxyURL      = 'http://aiproxy.herokuapp.com/';
    var AmazonURLRe     = /^http:\/\/www\.amazon\.co\.jp\/gp\/product\/([A-Z0-9]+).*?(?:[#](l|m|s)[:]([a-z]+))$/;
    var TemplatePrefix  = 'amazon-template-';
    var SizeMap         = { 's': '75', 'm': '160', 'l': '500' };

    var _CompiledTemplates = {};

    function _BuildImageURL( asin, size )  {
        return AIProxyURL + '?asin=' + asin + '&size=' + SizeMap[size];
    }

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

    function _BuildParams( asin, title, frame, size ) {
        return {
            title:          title,
            link:           ('http://www.amazon.co.jp/gp/product/' + asin),
            affiliateLink:  ('http://www.amazon.co.jp/gp/product/' + asin + '?tag=' + AssociateTag),
            imageLink:      _BuildImageURL( asin, size ),
            ASIN:           asin
        };
    }

    function main()  {
        var lst = document.querySelectorAll('p > a[href^="http://www.amazon.co.jp/gp/product/"]:only-child');
        for ( var i = 0, len = lst.length; i < len; i++ ) {
            var el      = lst[i];
            var href    = el.getAttribute('href');
            var title   = el.textContent;
            var capture = AmazonURLRe.exec(href);

            if ( ! capture ) {
                continue;
            }

            var asin    = capture[1];
            var size    = capture[2] || 'm' ;
            var frame   = capture[3] || 'detail' ;
 
            var params  = _BuildParams( asin, title, frame, size );

            el.parentNode.parentNode.replaceChild(
                _RenderTemplate( frame, params ),
                el.parentNode
            );
        }
    }

    document.addEventListener('DOMContentLoaded', main, false);
})('nyalranet-22');

