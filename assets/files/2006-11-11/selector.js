/* 
対応表

!        ... サポートできないかもしれない
?        ... サポートできそうでやってない
それ以外 ... サポート済み

CSS2:
    *
    E
    E F
    E > F
    E + F
    E[foo]
    E[foo="warning"]
    E[foo~="warning"]
    E[lang|="en"]
    E.myClass
    E#myID
    ?E:first-child
    ?E:lang(c)
    ?E:first-line
    ?E:first-letter
    ?E:before
    ?E:after
    ?E:link
    ?E:visited
    !E:active
    !E:hover
    !E:focus
CSS3:
    ?E[foo^="bar"]
    ?E[foo$="bar"]
    ?E[foo*="bar"]
    ?E:root
    ?E:nth-child(n)
    ?E:nth-last-child(n)
    ?E:nth-of-type(n)
    ?E:nth-last-of-type(n)
    ?E:last-child
    ?E:first-of-type
    ?E:last-of-type
    ?E:only-child
    ?E:only-of-type
    ?E:empty
    ?E:target
    ?E:enabled
    ?E:disabled
    ?E:contains("foo")
    ?E::first-line
    ?E::first-letter
    ?E::selection
    ?E::before
    ?E::after
    ?E:not(s)
    ?E ~ F
*/

/*
NAME: selector.js - Get elements by CSS selector
Auther:  |
    Nyarla, <thotep@nyarla.net>
    http://nyarla.net/blog/
License: |
    This libary Copyright (c) 2006, Nyarla,

    Permission is hereby granted, free of charge, to any person obtaining a
    copy of this software and associated documentation files (the "Software"),
    to deal in the Software without restriction, including without limitation
    the rights to use, copy, modify, merge, publish, distribute, sublicense,
    and/or sell copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included
    in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
    THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
    OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
    ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.
*/

document.getElementsBySelector = function (selector) {
    var tokens = selector.replace(/\s+/g, ' ').replace(/\s*([>+])\s*/g, '$1').split('');

    var foundElements = [document];

    var buf = {
        'element'     : '',
        'attributes'  : [],
        'attribute'   : '',
        'id'          : '',
        'class'       : '',
        'psedo'       : '',
        'combinators' : ' ',
        'clear'       : function () {
            this.element     = '';
            this.attributes  = [];
            this.attribute   = '';
            this.id          = '';
            this.class       = '';
            this.psedo       = '';
            this.combinators = '';
        }
    };

    var mode = 'element';

    var getTargetElements = function (tagName, targetElements) {
        var elements = [];
        var elmCount = 0;
        for ( var i = 0, len = targetElements.length; i < len; i++ ) {
            var target = targetElements[i];
            switch ( buf.combinators ) {
                case ' ':
                    var found = target.getElementsByTagName(tagName);
                    for ( var j = 0, found_len = found.length; j < found_len; j++ ) {
                        elements[elmCount++] = found[j];
                    }
                    break;
                case '>':
                    var childNodes = target.childNodes;
                    for ( var j = 0, node_len = childNodes.length; j < node_len; j++ ) {
                        var childNode = childNodes[j];
                        var nodeType = childNode.nodeType;
                        if ( nodeType == 1 ) {
                            if ( tagName != '*'
                              && childNode.tagName.toLowerCase() != tagName.toLowerCase() ) {
                                continue;
                            }
                            elements[elmCount++] = childNode;
                        }
                    }
                    break;
                case '+':
                    var nextNode = target.nextSibling;
                    while ( 1 ) {
                        if ( nextNode != null ) {
                            if ( nextNode.nodeType == 1 ) {
                                if ( tagName != '*'
                                  && tagName.toLowerCase() != nextNode.tagName.toLowerCase() ) {
                                    break;
                                }
                                elements[elmCount++] = nextNode;
                                break;
                            }
                            else {
                                nextNode = nextNode.nextSibling;
                                continue;
                            }
                        }
                        else {
                            break;
                        }
                    }
                    break;
            }
        }
    return elements;
    };

    var search = function () {
        var found = [];
        var tagName = buf.element.toLowerCase();
        if ( tagName.length == 0 ) {
            tagName = '*';
        }
        // Element
        found = getTargetElements( tagName, foundElements );
        // ID
        if ( buf.id.length != 0 ) {
            var targets = found;
            var id = buf.id;

            for ( var i = 0, len = targets.length; i < len; i++ ) {
                var target = targets[i];
                var targetId = target.getAttribute('id');
                if ( targetId && targetId == id ) {
                    found = [target];
                    break;
                }
            }
        }
        // Class
        if ( buf.class.length != 0 ) {
            var classes = buf.class.split('.');
            var targets = found;

            var getElementsByClassName = function ( classRegex, targetElements ) {
                var elements = [];
                var elmCount = 0
                for ( var i = 0, len = targetElements.length; i < len; i ++ ) {
                    var element = targetElements[i];
                    var className = element.className;
                    if ( className && className.match( classRegex ) ) {
                        elements[elmCount++] = element;
                    }
                }
                return elements;
            }

            for ( var i = 0, class_len = classes.length; i < class_len; i++ ) {
                var classRegex = new RegExp('^|\\s' + classes[i] + '\\s|$');
                if ( i == 0 ) {
                    found = getElementsByClassName( classRegex, targets );
                }
                else {
                    found = getElementsByClassName( classRegex, found );
                }
            }
        }
        // Attribute
        if ( buf.attributes.length != 0 ) {
            var attributes = buf.attributes;
            var targets = found;

            var getElementsByAttribute = function ( callback, targetElements ) {
                var elements = [];
                var elmCount = 0;
                for ( var i = 0, len = targetElements.length; i < len; i++ ) {
                    var element = targetElements[i];
                    if ( callback(element) > 0 ) {
                        elements[elmCount++] = element;
                    }
                }
                return elements;
            }

            for ( var i = 0, attr_len = attributes.length; i < attr_len; i++ ) {
                var attribute = attributes[i];

                attribute.match(/^(\w+)(?:([~|]?=)["](.+?)["])?$/);
                var attrName  = RegExp.$1;
                var operator  = RegExp.$2;
                var attrValue = RegExp.$3;

                var checkFunc;
                switch ( operator ) {
                    case  '=': // E[attr="foo"]
                        checkFunc = function (e) { return ( e.getAttribute(attrName) && e.getAttribute(attrName) == attrValue ) ? 1 : -1 };
                        break;
                    case '~=': // E[attr~="foo"]
                        checkFunc = function (e) { return ( e.getAttribute(attrName) && e.getAttribute(attrName).match( new RegExp('\\b' + attrValue + '\\b') ) ) ? 1 : -1 };
                        break;
                    case '|=': // E[lang|="en"]
                        checkFunc = function (e) { return ( e.getAttribute(attrName) && e.getAttribute(attrName).match( new RegExp('^' + attrValue + '-?') ) ) ? 1 : -1 };
                        break;
                    default  : // E[attr]
                        checkFunc = function (e) { return ( e.getAttribute(attrName) ) ? 1 : -1 };
                        break;
                }

                if ( i == 0 ) {
                    found = getElementsByAttribute( checkFunc, targets );
                }
                else {
                    found = getElementsByAttribute( checkFunc, found );
                }
            }

        }
/*
        // Psedo-class
        if ( buf.psedo.length != 0 ) {
            
        }
        // Psedo-elements
*/
        foundElements = found;
        buf.clear();
    };


    for ( var i = 0, len = tokens.length; i < len; i++  ) {
        var token = tokens[i];
        switch ( token ) {
            // selector
            case '[':
                mode = 'attribute';
                break;
            case ']':
                buf.attributes.push( buf.attribute );
                buf.attribute = '';
                mode = 'element';
                break;
            case '.':
                if ( mode == 'class' ) {
                    buf[mode] += token;
                }
                mode = 'class';
                break;
            case '#':
                mode = 'id';
                break;
            /*
            case ':':
                mode = 'psedo';
                break;
            */
            // combinators
            case ' ':
                search();
                buf.combinators = ' ';
                break;
            case '>':
                search();
                buf.combinators = '>';
                break;
            case '+':
                search();
                buf.combinators = '+';
                break;
            // elements
            case '*':
                buf.element = '*';
                break;
            // default
            default :
                buf[mode] += token;
                break;

        }
        if ( foundElements.length == 0 ) {
            return foundElements;
        }
    }
    search();

    return foundElements;
}

var $S = function () {
    if ( arguments.length == 1 ) {
        return document.getElementsBySelector(arguments[0]);
    }
    else {
        var results  = [];
        var resCount = 0;
        for ( var i = 0, len = arguments.length; i < len; i++ ) {
            results[resCount++] = document.getElementsBySelector(arguments[i]);
        }
        return results;
    }
}


1;
