#!/usr/bin/perl
# license : Public domain

use strict;
use warnings;

use DirHandle;
use FileHandle;

my $plugins_dir = '.';
my $output_file = './plugins_list.txt';

my $dh = DirHandle->new($plugins_dir);
my $fh = FileHandle->new();

my @plugins = ();

if ( defined $dh ) {
    @plugins
        = map  { $_ =~ m/^\d*(\w+)(_?)$/; $1 }
          grep { $_ =~ m/^\w+$/ && -f "$plugins_dir/$_" }
          sort $dh->read;
}

if ( $fh->open("> $output_file") ) {
    print $fh join( qq{\n}, @plugins ) . "\n";
}

1;
__END__
