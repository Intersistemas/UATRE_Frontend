import styled from '@emotion/styled';


export const Formulario = styled.form`
max-width: 600px;
width: 95%;
margin: 5rem auto 0 auto;
`;

export const Campo = styled.div`
    margin-bottom: 2rem;
    display: flex;
    aling-items: center;

    label{
        flex: 0 0 150px;
        font-size: 1.8rem;
    }   

    input{
        flex: 1:
        padding: 1rem;
    }
`;

/*'PT Sans', sans-serif;*/
export const InputSubmit = styled.input`
    backgound-color: var(--azul);
    width: 100%;
    padding: 1,5rem;
    text-aling: center;
    color: #FFF;
    font-size: 1.8rem;
    text-transform: uppercase;
    border: none;
    font-family: var(--fuente);
    font-weight: 700;

    &:hover{
        cursor: pointer;
    }

`;