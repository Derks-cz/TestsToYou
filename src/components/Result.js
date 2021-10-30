import {
  Container,
  Grid,
  Paper,
  Box,
  Toolbar,
  FormControl,
  Radio,
  Typography,
  CircularProgress,
  Checkbox
} from "@material-ui/core"
import React, { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"

const Result = ({match}) => {
  const history = useHistory()
  const [tests, setTests] = useState([])
  const [testTitle,setTestTitle] = useState("")
  const [loaded,setLoaded] = useState(false)
  const [answers,setAnswers] = useState([])
  const [result,setResult] = useState("")
  const [percent,setPercent] = useState(0)
  const [showCorrectAnswer,setShowCorrectAnswer] = useState(false)

  useEffect(()=>{
    let isMounted = true
    setLoaded(false)
    fetch(`/api/test/result/${match.params.url}`)
    .then(async res=>{
      if(res.ok){
        let response = await res.json()
        setTests(response.tests)
        setTestTitle(response.title)
        setAnswers(response.answers)
        setResult(response.result)
        setPercent(response.percent)
        setShowCorrectAnswer(response.showCorrectAnswer)
      }
      else{
        history.replace("/")
      }
      if(isMounted) setLoaded(true)
    })
    return () => isMounted = false
  },[match.params.url,history])
  useEffect(()=>{
    if(loaded){
    let ctx = document.getElementById('circle').getContext('2d');
    let al = percent;
    let start = 2.32;
    let cw = ctx.canvas.width;
    let ch = ctx.canvas.height; 
    let diff;
    function progressSim(){
      diff = ((al / 100) * Math.PI*2*10).toFixed(2);
      ctx.clearRect(0, 0, cw, ch);
      ctx.lineWidth = 17;
      ctx.fillStyle = '#4285f4';
      ctx.strokeStyle = "#4285f4";
      ctx.textAlign = "center";
      ctx.font="28px monospace";
      ctx.fillText(al+'%', cw/2 , ch/2+30, cw+12);
      ctx.beginPath();
      ctx.arc(cw/2, ch/2+25, 75, start, diff/10+start, false);
      ctx.stroke();
    
    }
    progressSim()
  }
  },[percent,loaded])
  return (
    <Container style={{ marginTop: "4px" }}>
      <Grid container style={{position:"relative",width:"100%"}}>
        {loaded ?<Grid item xs={12}>
          <Paper elevation={7}>
            <Typography variant="h6" style={{textAlign:"center",wordBreak:"break-word"}}>
             {testTitle}
            </Typography>
            </Paper>
            <>
                {tests.length &&
                  tests.map((test, i) => (
                    <Paper elevation={7} key={test.id}>
                    <Box style={{ margin: "8px" }} >
                      <Toolbar variant="dense">
                        <span
                          style={{ wordBreak: "break-word",padding:"4px" }}
                        >
                          №{i + 1} {test.title}
                        </span>
                      </Toolbar>
                      {test.variants.map((variant) => (
                        <Box key={variant.id}>
                          <Toolbar variant="dense">
                            <FormControl style={{flexShrink:0}}>
                               {test.multiple ? <Checkbox disabled checked={answers.some(answer => answer.testId === test.id && answer.variants.some(v=> v.id === variant.id))}  /> :
                                <Radio disabled checked={answers.some(answer => answer.testId === test.id && answer.variants.some(v=> v.id === variant.id))} />
                                }
                            </FormControl>
                            {showCorrectAnswer ? <p style={{ wordBreak: "break-all",color:`${test.multiple ? 
                            (answers.some(answer => answer.testId === test.id && test.variants.some(tv=> tv.id === variant.id && tv.correct))  
                            ? "lime" : 
                            answers.some(answer => answer.testId === test.id && answer.variants.some(v=> v.id !== variant.id && variant.correct))  
                            ? "red"   : 
                            answers.some(answer => answer.testId === test.id && answer.variants.some(v=> v.id === variant.id && !variant.correct)) ? "red" :""   )

                            :answers.some(answer => answer.testId === test.id && answer.variants.some(v=> v.id === variant.id && variant.correct))
                            ?"lime":answers.some(answer => answer.testId === test.id && answer.variants.some(v=> v.id === variant.id && !variant.correct))
                            ?"red":answers.some(answer => answer.testId === test.id && test.variants.some(tv=> tv.id === variant.id && tv.correct) )
                            ?"lime":""}`}}>{variant.title}
                            </p> :<p>{variant.title}</p>}
                          </Toolbar>
                        </Box>
                      ))}
                    </Box>
                    </Paper>
                  ))}
                  <Paper elevation={7}>
                  <div style={{marginBottom:"30px",width:"100%",flexDirection:"column",display:"flex",alignItems:"center"}}>
                    <div style={{display:"flex",flexDirection:"column"}}>
                      <Typography variant="h6" style={{textAlign:"center"}}>Результат</Typography>
                      <canvas id="circle"></canvas>
                    </div>
                    <span>{result}</span>
                  </div>
                  </Paper>
              </>
              
        </Grid>:
        <Grid item xs={12} style={{textAlign:"center"}}>
          <Paper elevation={7} style={{minHeight:"50vh"}}><CircularProgress style={{marginTop:"25vh"}}/></Paper>
        </Grid>}
      </Grid>
    </Container>
  )
}

export default React.memo(Result)
