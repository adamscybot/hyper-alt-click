# hyper-alt-click
An experimental (hacky) plugin to allow moving the cursor by alt+clicking in [hyper](https://hyper.is/). Very early in development.

![Screenshot](https://cloud.githubusercontent.com/assets/1210785/23743760/cdb010da-04a9-11e7-889f-2af23f3995bc.gif)

**DISCLAIMER**: This plugin is essentially one giant hack due to the limited API provided by Hyper. Use it with caution! Actual support should be added to hyper core. Unless someone finds a better way than this!

# Installation

add `hyper-alt-click` to `~/.hyper.js`'s plugin list.

```javascript
{
	//...
	plugins: ["hyper-alt-click"],
}
```

# FAQ

## Does it work on windows?
No idea, but I don't see why not.

## Does it work in VIM/Nano/Etc...
Not yet, as it cant seem to handle the new lines. This is possible though in a future version and with more research.

## Why experimental/hacky?
[explanation incoming]
