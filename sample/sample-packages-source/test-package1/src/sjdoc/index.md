# Test1
[![Build Status](https://travis-ci.org/sj-js/popman.svg?branch=master)](https://travis-ci.org/sj-js/popman)
[![All Download](https://img.shields.io/github/downloads/sj-js/popman/total.svg)](https://github.com/sj-js/popman/releases)
[![Release](https://img.shields.io/github/release/sj-js/popman.svg)](https://github.com/sj-js/popman/releases)
[![License](https://img.shields.io/github/license/sj-js/popman.svg)](https://github.com/sj-js/popman/releases)
    
- It just test.. Change yours~
- https://github.com/sj-js/popman

    

## Index
*@* **order** *@*
```
- Test1
- Functions
- Example
```



## 1. Getting Started

### 1-1. Load Script

1. 스크립트 불러오기
    ```html    
    <script src="https://cdn.jsdelivr.net/npm/@sj-js/test/something/test1.js"></script>
    <script>
         var test1 = new Test1();
    </script>
    ```  
    
    *@* *+prefix* *x* *@* 
    ```html
    <script src="../test-package1/test1.js"></script>
    <script>
         var test1 = new Test1();
    </script>
    ```



### 1-2. Run

1. Example   
    *@* *!* *@*
    ```html
    <body>        
        Hello Test1
        <button onclick="test1.run();">RUN</button>
        <div id="tester">TEST</div>
    </body> 
    <script>
        document.getElementById('tester').innerHTML = 'RUN :D';
    </script>
    ```


### 1-3. Stop          
  
Let's test `.stop()`

1. This is test1 documents
    - `wow`!

2. `stop()`을 사용합니다.
    ```js
    test1.stop();
    ```

3. Example
    *@* *!* *@*
    ```html
    <script>
        test1.run();
    </script>
    
    <body>
        <button onclick="test1.stop();">STOP</button>
        <div>
           hello :D
        </div>       
     </body>
    ```
  
### 1-4. Exit

1. Example
    *@* *!* *@*
    ```html
    <script>
        test1.run();
    </script>
    
    <body>
        <button onclick="test1.stop();">STOP</button>
        <button onclick="test1.exit();">EXIT</button>
        <div>
           hello testing ... 
        </div>       
    </body>
    ```
  