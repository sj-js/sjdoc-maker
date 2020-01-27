# Test2
## 📄
[![Build Status](https://travis-ci.org/sj-js/boxman.svg?branch=master)](https://travis-ci.org/sj-js/boxman)
[![All Download](https://img.shields.io/github/downloads/sj-js/boxman/total.svg)](https://github.com/sj-js/boxman/releases)
[![Release](https://img.shields.io/github/release/sj-js/boxman.svg)](https://github.com/sj-js/boxman/releases)
[![License](https://img.shields.io/github/license/sj-js/boxman.svg)](https://github.com/sj-js/boxman/releases)
- It just test.. Change yours~
- https://github.com/sj-js/boxman


        
## Index
*@* **order** *@*
```
- Test2
- Example
```



## 1. Getting Started

### 1-1. Load Script

1. 스크립트 불러오기
    ```html    
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/test/something/test2.js"></script>
    <script>
         var test2 = new Test2();
    </script>
    ```  
    
    *@* *+prefix* *x* *@* 
    ```html
    <script src="../test-package2/test2.js"></script>
    <script>
         var test2 = new Test2();
    </script>
    ```



### 1-2. Love

1. Example   
    *@* *!* *@*
    ```html
    <body>        
        Hello Test1
        <button onclick="test2.love();">LOVE</button>
        <div id="tester">TEST</div>
    </body> 
    <script>
        document.getElementById('tester').innerHTML = 'LOVE :D';
    </script>
    ```


### 1-3. Cheer          
  
Let's test `.cheer()`

1. This is test2 documents
    - `wow`!

2. `cheer()`을 사용합니다.
    ```js
    test2.cheer();
    ```

3. Example
    *@* *!* *@*
    ```html
    <script>
        test2.love();
    </script>
    
    <body>
        <button onclick="test2.cheer();">CHEER</button>
        <div>
           hello :D
        </div>       
     </body>
    ```
  
### 1-4. Donate

1. Example
    *@* *!* *@*
    ```html
    <script>
        test2.love();
    </script>
    
    <body>
        <button onclick="test2.cheer();">CHEER</button>
        <button onclick="test2.donate();">DONATE</button>
        <div>
           hello testing ... 
        </div>       
    </body>
    ```
  