(function () {
    "use strict";

    var Selector   = 'noscript,h1,h2,h3,h4,h5,h6,p,blockquote,li,dt,dd,figure,figcaption,div,a,em,strong,s,cite,q,dfn,abbr,sub,sup,i,b,u,mark,bdi,bdo,span,ins,del,th,td,form,fieldset,legend,label,button';
    var MarkupRe   = /[{](.+?)[}]/g;

    function MarkupRuby ( str, captured, offset, s ) {
        var strLst = captured.split('|');
        var target = strLst.shift().split('');
        var ruby   = strLst;
    
        var ret    = '<ruby>';
        if ( target.length == ruby.length ) {
            for ( var i = 0, len = target.length; i < len; i++ ) {
                ret = ret + target[i] + '<rt>' + ruby[i] + '</rt>';
            }
        }
        else {
            ret = ret + target.join('') + '<rt>' + ruby.join('') + '</rt>';
        }
        ret = ret + '</ruby>';
    
        return ret;
    }

    function ReplaceHandler() {
        var lst = document.querySelectorAll(Selector);
        for ( var idx = 0, lstLen = lst.length; idx < lstLen; idx++ ) {
            var elm         = lst[idx];
            var children    = elm.childNodes;
            for ( var nIdx = 0, nLen = children.length; nIdx < nLen; nIdx++ ) {
                var node = children[nIdx];
                if ( node.nodeType == 3 ) {
                    var span = document.createElement('span');
                        span.innerHTML = node.nodeValue.replace( MarkupRe, MarkupRuby );
                    elm.replaceChild( span, node );
                }
            }
        }
    }

    window.addEventListener('DOMContentLoaded', ReplaceHandler, false);

})();
