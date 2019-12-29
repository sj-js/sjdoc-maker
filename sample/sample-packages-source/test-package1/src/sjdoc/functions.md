# Functions
   
*@* *+prefix* *x* *@* 
```html
<script src="../test-package1/test1.js"></script>
<script>
     var test1 = new Test1();
</script>
```   
  
    
## run
- Hello run    
    *@* *!* *@*
    ```html
    <body>
        TEST<br/>
        <button onclick="test1.run();">RUN</button><br/>
    </body>
    <script>
        console.log('Something..');
    </script>
    ```

## stop
- Hello stop    
    *@* *!* *@*
    ```html
    <body>
        TEST A<br/>
        <button onclick="test1.run();">RUN</button><br/>
        <button onclick="test1.stop();">STOP</button><br/>
    </body>
    <script>
        console.log('Something..');
    </script>
    ```

    *@* *!* *@*
    ```html
    <body>
        TEST B<br/>
        <button onclick="test1.stop();">STOP</button><br/>
    </body>
    <script>
        console.log('Something..');
        test1.run();
    </script>
    ```
    
## exit
- Test exit()
    *@* *!* *@*
    ```html
    <body>
        TEST B<br/>
        <button onclick="test1.exit();">EXIT</button><br/>
    </body>
    <script>
        console.log('Something..');
        test1.run();
    </script>
    ```
    
    - `haha`: hoho
    - `hehe`: hihi
    - `huhu`: kiki