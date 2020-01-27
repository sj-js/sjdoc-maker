# sjdoc-maker
## 📄
[![Build Status](https://travis-ci.org/sj-js/sjdoc-maker.svg?branch=master)](https://travis-ci.org/sj-js/sjdoc-maker)
[![All Download](https://img.shields.io/github/downloads/sj-js/sjdoc-maker/total.svg)](https://github.com/sj-js/sjdoc-maker/releases)
[![Release](https://img.shields.io/github/release/sj-js/sjdoc-maker.svg)](https://github.com/sj-js/sjdoc-maker/releases)
[![License](https://img.shields.io/github/license/sj-js/sjdoc-maker.svg)](https://github.com/sj-js/sjdoc-maker/releases)
- Markdown을 활용하여 문서를 작성할 수 있습니다.
- 예제코드를 사용자가 바로 체험하거나 편집해 볼 수 있습니다.
- ✨ Source: https://github.com/sj-js/sjdoc-maker
- ✨ Document: https://sj-js.github.io/sj-js/sjdoc-maker



## Index
*@* **order** *@*
```
- sjdoc-maker
- Example
```



## 1. Documents for your project
 
### 1-1. With markdown
1. md파일 생성
    - `{ROOT_OF_YOUR_PROJECT}/src/sjdoc/index.md`: 문서는 Markdown으로 작성하며 추가적으로 메뉴/소스편집/실행기 등 확장된 기능을 사용할 수 있습니다.
    - `{ROOT_OF_YOUR_PROJECT}/src/sjdoc/*.md`: 여러 문서를 만드세요.
2. 구조
    - File 1개당 `1개의 Page`로 구성됩니다.
    - Page의 시작은 `#`으로 제목을 붙여줍니다. 제목은 `왼쪽메뉴명`과 `Index Page의 목록기능을 사용시 노출`됩니다.
        
    
### 1-2. Check Sample
1. Example Source 
    1. `git clone http://github.com/sj-js/sjdoc-maker.git`
    2. Sample Source(`/sample/sample-packages-source`)를 확인하시고 
    3. 이를 빌드한 Sample Document(`/sample/sample-packages-document`)를 확인하시기 바랍니다.
2. Check:
    - Source: https://github.com/sj-js/sjdoc-maker/tree/master/sample/sample-packages-source/test-package1/src/sjdoc/index.md
    - Build: https://sj-js.github.io/sjdoc-maker/test-package1/index.html


### 1-3. 기능
소스코드를 표시하는 `Markdown 문법`인 \`\`\`의 위에 다음을 명시하여 특정 효과를 볼 수 있습니다.

- 인덱스 메뉴 생성
    ```markdown
    *@* **order** *@*
    ```
    \`\`\`와 \`\`\` 안에는 다음과 같이 각 Page의 첫번째 `#`의 이름을 열거하여 목록을 만듭니다.
    ```
    - BoxMan
    - Event
    - Example
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



## 2. Build your documents with SJDoc-maker
SJDoc-maker로 당신의 문서를 생성하세요.
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
            .setHome('test-package1/index')      
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