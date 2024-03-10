let cog = document.querySelector('#cog');
let Setting = document.querySelector('.Setting');
cog.onclick = () => {
    cog.classList.toggle('active');
    Setting.classList.toggle('active');
    Function.classList.remove('active');
    User.classList.remove('active');
    grid.classList.remove('active');
    user.classList.remove('active');

}




let grid = document.querySelector('#grid');
let Function = document.querySelector('.Function');
grid.onclick = () =>{
    grid.classList.toggle('active');
    Function.classList.toggle('active');
    Setting.classList.remove('active');
    User.classList.remove('active');
    cog.classList.remove('active');
    user.classList.remove('active');
}




let user = document.querySelector('#user');
let User = document.querySelector('.User')
user.onclick = () =>{
    user.classList.toggle('active');
    User.classList.toggle('active');
    Setting.classList.remove('active');
    Function.classList.remove('active');
    cog.classList.remove('active');
    grid.classList.remove('active');


}