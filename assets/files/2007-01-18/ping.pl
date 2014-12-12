#!/usr/bin/perl

use strict;
use warnings;

our $VERSION = '0.1';

use Getopt::Long;
use YAML ();
use Carp;
use Array::Uniq;
use Pod::Usage;
use XMLRPC::Lite;
use File::Spec;

my @ping_list_files = q{};
my @ping_urls       = ();
my $blog_title      = q{};
my $blog_url        = q{};

my $ver      = q{};
my $help    = q{};
my $usage   = q{};
my $man     = q{};

my %option = (
    'list|l=s@' => \@ping_list_files,
    'ping|p=s@' => \@ping_urls,
    'title|t=s' => \$blog_title,
    'url|u=s'   => \$blog_url,
    # meta commands
    'version|v' => sub { print "Ping.pl version $VERSION\n" ; exit(1) },
    'help|?'    => sub { pod2usage(1) },
    'man|m'     => sub { pod2usage( -verbose => 2 ) },
);

GetOptions( %option )
    or pod2usage(2);

# get ping url list
@ping_urls = split_list( @ping_urls );
@ping_list_files = split_list( @ping_list_files );

my $lists = [];
for my $file ( @ping_list_files ) {
    my $path = File::Spec->rel2abs( $file );
    if ( -f $path && -r $path ) {
        eval { push @ping_urls, @{ YAML::LoadFile( $path ) } };
        carp "$@\n" if ( $@ );
    }
}

@ping_urls = uniq sort { $a cmp $b } @ping_urls;

# get $blog_title and $blog_url
croak 'Argument title is empty.'    if ( !$blog_title );
croak 'Argument url is empty.'      if ( !$blog_url );

# send ping update
my @success = ();
my @failure = ();
for my $ping_url ( @ping_urls ) {
    print "Send update ping to $ping_url\n";
    my $res = XMLRPC::Lite->proxy($ping_url, timeout => 15)
                          ->call('weblogUpdates.ping', $blog_title, $blog_url)
                          ->result;
    if ( $res->{'flerror'} ) {
        print "Error: " . $res->{'messege'} . "\n";
        push @failure, $ping_url;
        next;
    }
    push @success, $ping_url;
}

# print ping result
print "\nSend update ping result\n";
if ( @success > 0 ) {
    print "success:\n";
    print "\t" . join( qq{\n\t}, @success ) . "\n";
}
if ( @failure > 0 ) {
    print "failure:\n";
    print "\t" . join( qq{\n\t}, @failure ) . "\n";
}

exit;

sub split_list {
    my @list = @_;
    return split( q{,}, join( q{,}, @list ) );
}

1;
__END__

=head1 NAME

Ping.pl - Send update ping script

=head1 VERSION

Ping.pl version 0.1

=head1 USAGE

Ping.pl --list='./PingURLList.yaml' --title="Blog titile" --url="Blog URL"

=head1 SYNOPSIS

Ping.pl [options]

    Options:
        --list        ping URL list YAML files.
        --ping        ping URLs.
        --title       blog title.
        --url         blog URL.
        --help        print script help.
        --man         full documentation.
        --version     print script version.

=head1 OPTIONS

=over 7

=item B<list>

Specifying the YAML file of destination URL list of ping.
You can specify two or more files by delimiting it by the comma.

=item B<ping>

Specifying ping destination URLs.
You can specify two or more files by delimiting it by the comma.

=item B<title>

Specifying the title of Blog.

=item B<url>

Specifying the URL of Blog.

=item B<help>

Print a brief help message and exits.

=item B<man>

Prints the manual page and exits.

=item B<version>

Print this script version and exits.

=back

=head1 LICENSE

Ping.pl Copyright 2007, "Nyarla," <thotep@nyarla.net>

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
