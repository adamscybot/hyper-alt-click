function onMoveCursorWithMouse (delta) {
  return (dispatch, getState) => {
    dispatch({
      type: 'MOUSE_MOVE_CURSOR',
      delta: delta,
      effect() {
      //  dispatch({type: "SESSION_USER_DATA", data: "[D"})
        const { sessions } = getState()
        const uid = sessions.activeUid
        const keyCode = delta < 0 ? '\u001bOD' : '\u001bOC'
        console.log(keyCode)
        window.rpc.emit('data', {
          uid: uid,
          data: keyCode.repeat(Math.abs(delta))
        })
      }
    })
  }
}

exports.mapTermsDispatch = (dispatch, map) => {
  return Object.assign(map, {
    onMoveCursorWithMouse: (delta) => {
      dispatch(onMoveCursorWithMouse(delta))
    }
  })
}

exports.getTermGroupProps = (uid, parentProps, props) => {
  return Object.assign(props, {
    onMoveCursorWithMouse: parentProps.onMoveCursorWithMouse
  })
}

exports.getTermProps = (uid, parentProps, props) => {
  return Object.assign(props, {
    onMoveCursorWithMouse: parentProps.onMoveCursorWithMouse
  })
}
function findRow (el) {
  if (el.tagName === 'X-ROW') {
    return el
  }

  while ((el = el.parentElement) && el.tagName !== 'X-ROW') {}

  return el
}

function textContentOnly (node) {
  return Array.from(node.childNodes).filter((node) => {
    return node.nodeType === 3
  }).map((node) => {
    return node.nodeValue
  }).join('')
}

exports.decorateTerm = function (Term, { React }) {
  return class extends React.Component {
    constructor (props, context) {
      super(props, context)
      this.onCursorClick = this.onCursorClick.bind(this)
      this.onTerminal = this.onTerminal.bind(this)
    }

    onTerminal (term) {
      if (this.props.onTerminal) {
        this.props.onTerminal(term)
      }

      this.term = term
      const { screen_, onTerminalReady } = term

      let self = this
      term.onTerminalReady = function () {
        onTerminalReady.apply(this, arguments)
        self.screenNode = term.scrollPort_.getScreenNode()
        self.iframe = term.scrollPort_.iframe_
        self.screenNode.addEventListener('click', self.onCursorClick)
      }
    }

    onCursorClick (event) {
      if (!event.altKey) {
        return
      }

      let cursorRow = this.term.screen_.cursorRowNode_

      let rowClicked = findRow(event.target)
      if (rowClicked != null) {
        let wholeTextContent = rowClicked.textContent
        let textContent = textContentOnly(rowClicked)

        let dummyCopy = document.createElement('span')
        dummyCopy.style.position = 'absolute'
        dummyCopy.style.left = 0

        for (let i = 0; i < wholeTextContent.length; i++) {
          let charSpan = document.createElement('span')
          charSpan.setAttribute('data-index', i)
          charSpan.innerHTML = wholeTextContent[i]
          dummyCopy.appendChild(charSpan)
        }

        rowClicked.appendChild(dummyCopy)

        let el = this.iframe.contentWindow.document.elementFromPoint(event.pageX, event.pageY)

        let delta = 0

        if (cursorRow == rowClicked) {
          delta = parseInt(el.getAttribute('data-index')) - this.term.screen_.cursorOffset_ - (wholeTextContent.length - textContent.length)
        } else {
          let rowNodes = Array.from(this.term.scrollPort_.rowNodes_.childNodes)
          let rowClickedIndex = rowNodes.indexOf(rowClicked)
          let cursorRowIndex = rowNodes.indexOf(cursorRow)

          if (rowClickedIndex < cursorRowIndex) {
            for (let i = rowClickedIndex + 1; i < cursorRowIndex; i++) {
              delta -= rowNodes[i].textContent.length
            }
            delta -= this.term.screen_.cursorOffset_
            delta -= (wholeTextContent.length - parseInt(el.getAttribute('data-index')))
          } else {
            for (let i = cursorRowIndex + 1; i <= rowClickedIndex -1; i++) {
              delta += rowNodes[i].textContent.length
            }
            delta += textContentOnly(cursorRow).length - this.term.screen_.cursorOffset_
            delta += parseInt(el.getAttribute('data-index'))
          }
        }

        rowClicked.removeChild(dummyCopy)
        this.props.onMoveCursorWithMouse(delta)

      }
    }

    render () {
      const props = Object.assign({}, this.props, {
        onTerminal: this.onTerminal
      })

      return React.createElement(Term, props)
    }
  }
}
