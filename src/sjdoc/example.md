# Example


## Example - ./sjdoc-config/sjdoc-sj-js.js
- ▪▪▪
    ```js
    const SjMarkdownManager = require('../SjMarkdownManager');
    const path = require('path');
    const libraryGroupRootPath = path.resolve(__dirname, '../../');
    
    const CROSSMAN_DIR = path.resolve(libraryGroupRootPath, 'crossman');
    const BOXMAN_DIR = path.resolve(libraryGroupRootPath, 'boxman');
    const POPMAN_DIR = path.resolve(libraryGroupRootPath, 'popman');
    const KEYMAN_DIR = path.resolve(libraryGroupRootPath, 'keyman');
    const JELLY_DIR = path.resolve(libraryGroupRootPath, 'jelly');
    const SJDOCMAKER_DIR = path.resolve(libraryGroupRootPath, 'sjdoc-maker');
    const MENUMAN_DIR = path.resolve(libraryGroupRootPath, 'menuman');
    const FIXMAN_DIR = path.resolve(libraryGroupRootPath, 'fixman');
    const PARTMAN_DIR = path.resolve(libraryGroupRootPath, 'partman');
    const SLIDEMAN_DIR = path.resolve(libraryGroupRootPath, 'slideman');
    const VARIABLEMAN_DIR = path.resolve(libraryGroupRootPath, 'variableman');
    const TREEMAN_DIR = path.resolve(libraryGroupRootPath, 'treeman');
    const STORAGEMAN_DIR = path.resolve(libraryGroupRootPath, 'storageman');
    
    const PAINTMAN_DIR = path.resolve(libraryGroupRootPath, 'paintman');
    const GITHUB_IO_DIR = path.resolve(libraryGroupRootPath, 'sj-js.github.io');
    
    /** Exports **/
    module.exports = new SjMarkdownManager()
        .setAlias('sj-js')
        .setHome('boxman/index')
        .setLibraryNameAndMarkdownPathsMap({
            boxman : [BOXMAN_DIR + '/src/sjdoc/**/*.md'],
            popman : [POPMAN_DIR + '/src/sjdoc/**/*.md'],
            keyman : [KEYMAN_DIR + '/src/sjdoc/**/*.md'],
            menuman : [MENUMAN_DIR + '/src/sjdoc/**/*.md'],
            fixman : [FIXMAN_DIR + '/src/sjdoc/**/*.md'],
            partman : [PARTMAN_DIR + '/src/sjdoc/**/*.md'],
            slideman : [SLIDEMAN_DIR + '/src/sjdoc/**/*.md'],
            variableman : [VARIABLEMAN_DIR + '/src/sjdoc/**/*.md'],
            'sjdoc-maker' : [SJDOCMAKER_DIR + '/src/sjdoc/**/*.md'],
            jelly : [JELLY_DIR + '/src/sjdoc/**/*.md'],
        })
        .setLibraryNameAndPublicDirRawFilesMap({
            crossman : [CROSSMAN_DIR + '/src/js/*.js'],
            boxman : [BOXMAN_DIR + '/src/js/*.js', BOXMAN_DIR + '/src/css/*.css'],
            popman : [POPMAN_DIR + '/src/js/*.js'],
            keyman : [KEYMAN_DIR + '/src/js/*.js'],
            menuman : [MENUMAN_DIR + '/src/js/*.js', MENUMAN_DIR + '/src/css/*.css'],
            fixman : [FIXMAN_DIR + '/src/js/*.js'],
            partman : [PARTMAN_DIR + '/src/js/*.js', PARTMAN_DIR + '/src/css/*.css'],
            slideman : [SLIDEMAN_DIR + '/src/js/*.js', SLIDEMAN_DIR + '/src/css/*.css'],
            storageman : [STORAGEMAN_DIR + '/src/js/*.js'],
            variableman : [VARIABLEMAN_DIR + '/src/js/*.js'],
            'jelly' : [JELLY_DIR + '/src/js/**/*.js', JELLY_DIR + '/src/css/**/*.css'],
        })
        .setDist(GITHUB_IO_DIR + '/sj-js')
        ;
    ```



## Example - ./sjdoc-config/sjdoc-vis-networkman.js
- ▪▪▪
    ```js
    const SjMarkdownManager = require('../SjMarkdownManager');
    const path = require('path');
    const libraryGroupRootPath = path.resolve(__dirname, '../../');
    
    const HELP_LIB_VISNETWORKMAN = path.resolve(libraryGroupRootPath, './vis-networkman');
    const CROSSMAN_DIR = path.resolve(libraryGroupRootPath, 'crossman');
    const BOXMAN_DIR = path.resolve(libraryGroupRootPath, 'boxman');
    const POPMAN_DIR = path.resolve(libraryGroupRootPath, 'popman');
    const GITHUB_IO_DIR = path.resolve(libraryGroupRootPath, 'sj-js.github.io');
    
    /** Exports **/
    module.exports = new SjMarkdownManager()
        .setAlias('vis-networkman')
        .setHome('vis-networkman/index')
        .setLibraryNameAndMarkdownPathsMap({
            'vis-networkman' : [HELP_LIB_VISNETWORKMAN + '/src/sjdoc/**/*.md'],
        })
        .setLibraryNameAndPublicDirRawFilesMap({
            'vis-networkman': [
                HELP_LIB_VISNETWORKMAN + '/src/js/**/*.js',
                HELP_LIB_VISNETWORKMAN + '/src/css/**/*.css',
                HELP_LIB_VISNETWORKMAN + '/src/lib/vis/vis-network.min.js',
                HELP_LIB_VISNETWORKMAN + '/src/lib/vis/vis-network.min.css'
            ],
            'crossman': [
                CROSSMAN_DIR + '/src/js/crossman.js',
            ],
            'boxman': [
                BOXMAN_DIR + '/src/js/boxman.js',
                BOXMAN_DIR + '/src/css/boxman.css'
            ],
            'popman': [
                POPMAN_DIR + '/src/js/popman.js'
            ],
        })
        .setDist(GITHUB_IO_DIR + '/vis-networkman')
        ;
    ```