# sjdoc-maker

## Index
*@* **order** *@*
```
- sjdoc-maker
- Example 
```


## 1. Documents for your project - 당신의 프로젝트 문서를 작성하세요.
1. `{ROOT_OF_YOUR_PROJECT}/src/sjdoc/README.md`를 만듭니다.
    문서는 `Markdown`으로 작성하며 추가적으로 `메뉴`와 `소스편집/실행기` 등 확장된 기능을 사용할 수 있습니다.
    
2. `{ROOT_OF_YOUR_PROJECT}/src/sjdoc/*.md`
    당신의 프로젝트를 설명할 수 있는 여러 문서(*.md)를 만드세요.
      
#### ※ 기능열람
소스코드를 명시하는 **```**의 위에 다음을 명시하여 특정 효과를 볼 수 있습니다.
- 인덱스 메뉴 생성
    ```markdown
    *@* **order** *@*
    ```
- 소스 편집/실행기 생성
    ```markdown
    *@* *!* *@*
    ```
- Before소스 등록
    ```markdown
    *@* *+prefix* *@*
    ```
- Before소스 등록하고 숨기기
    ```markdown
    *@* *+prefix* *x* *@*
    ```

#### ※ Sample
사용법 예시는 `git clone http://github.com/sj-js/sjdoc-maker.git`으로 소스코드에 있는 `{ROOT_OF_SJDOCMAKER}/sample/sample-packages-source`와 `{ROOT_OF_SJDOCMAKER}/sample/sample-packages-document`를 확인하시기 바랍니다. 







## 2. Build your documents with SJDoc-maker - SJDoc-maker로 당신의 문서를 생성하세요.
1. clone project
    ```bash
    git clone http://github.com/sj-js/sjdoc-maker.git
    ```
    ```bash
    cd ./sjdoc-maker
    ```

2. make your build script
    - {ROOT_OF_SJDOCMAKER}/sjdoc-config/sjdoc-sample1.js
        ```js
        const SjMarkdownManager = require('../SjMarkdownManager');
        const path = require('path');
        /** path to your project source **/
        const TEST_PACKAGE1_SRC = path.resolve(__dirname, '../sample/sample-packages-source/test-package1');          
          
        /** Exports **/
        module.exports = new SjMarkdownManager()
            //통합문서를 구분짓는 이름을 설정
            .setAlias('sample1')                   
            //통합문서의 시작페이지를 설정      
            .setHome('test-package1/README')      
            //통합문서 폴더 하위에 생성할 `Library별 폴더명`과 Parsing할 `md파일들`을 매칭시킵니다. (Object구조로 정의합니다.)
            .setLibraryNameAndMarkdownPathsMap({  
                'test-package1': [
                    TEST_PACKAGE1_SRC + '/src/sjdoc/**/*.md'
                ],
            })
            //통합문서 폴더 하위에 생성할 `Library별 폴더명`과 필요한 `js/css 등의 파일들`을 매칭시킵니다. (Object구조로 정의합니다.)
            .setLibraryNameAndPublicDirRawFilesMap({
                'test-package1': [
                    TEST_PACKAGE1_SRC + '/src/js/test1.js'
                ],
            });
        ```

3. Build your documents
    ```bash
    npm run build
    ```
    OR Test your documents
    ```bash
    npm run dev
    ```

4. Check your documents
    ```bash
    {ROOT_OF_SJDOCMAKER}/dist
    ```