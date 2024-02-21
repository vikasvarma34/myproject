import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useForm = (initialState) => {
    const [form, setForm] = useState(initialState);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const addQuestion = () => {
        const newQuestion = {
            questionId: uuidv4(),
            order: form.questions.length + 1,
            questionText: '',
            type: '',
            isOptional: false,
            options: [],
            parentId: '',
        };
        setForm((prevForm) => ({
            ...prevForm,
            questions: [...prevForm.questions, newQuestion],
        }));
    };

    const handleQuestionChange = (index, e) => {
        const { name, value } = e.target;
        const questions = [...form.questions];
    
        // Directly update the specified field within the question object
        questions[index] = { ...questions[index], [name]: value };
    
        setForm((prevForm) => ({
            ...prevForm,
            questions,
        }));
    };
    

    const handleOptionChange = (questionIndex, optionIndex, e) => {
        const { name, value } = e.target;
        const questions = [...form.questions];
        questions[questionIndex].options[optionIndex] = {
            ...questions[questionIndex].options[optionIndex],
            [name]: value,
        };
        setForm((prevForm) => ({
            ...prevForm,
            questions,
        }));
    };

    const addOption = (questionIndex) => {
        const newOption = {
            optionId: uuidv4(),
            value: '',
            text: '',
            jump: 'false', 
            jumpTo: ''
        };
        const updatedQuestions = form.questions.map((question, idx) => {
            if (idx === questionIndex) {
                return {
                    ...question,
                    options: [...question.options, newOption]
                };
            }
            return question;
        });

        setForm((prevForm) => ({
            ...prevForm,
            questions: updatedQuestions
        }));
    };

    const deleteQuestion = (questionIndex) => {
        const questions = form.questions.filter((_, index) => index !== questionIndex);
        setForm((prevForm) => ({
            ...prevForm,
            questions,
        }));
    };

    const deleteOption = (questionIndex, optionIndex) => {
        const questions = [...form.questions];
        questions[questionIndex].options = questions[questionIndex].options.filter((_, index) => index !== optionIndex);
        setForm((prevForm) => ({
            ...prevForm,
            questions,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Validate required form fields
        if (!form.formName || !form.title || !form.description || !form.tier || form.mandatory === '') {
            console.error('Incomplete form data');
            return;
        }
    
        const formDataToSend = {
            formName: form.formName,
            order: parseInt(form.formOrder),
            title: form.title,
            description: form.description,
            tier: form.tier,
            mandatory: form.mandatory === 'yes',
            questions: form.questions.map(question => ({
                questionText: question.questionText,
              //  parentId: question.parentId || '',
                order: question.order,
                isOptional: !question.isOptional,
                type: question.type,
                options: question.options.map(option => ({
                    value: option.value,
                    text: option.text,
                    jump: option.jump === 'true',
                    jumpTo: option.jumpTo ? parseInt(option.jumpTo) : undefined
                })),
                ...(question.parentId && { parentId: question.parentId })
            }))
        };
    
        try {
            const response = await fetch('http://localhost:8080/forms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formDataToSend),
            });
    
            if (response.ok) {
                console.log('Form submitted successfully');
                // Optionally reset form or provide further user feedback
            } else {
                console.error('Form submission failed');
                // Handle server-side validation errors or issues
            }
        } catch (error) {
            console.error('Error submitting form:', error.message);
            // Handle network errors or unexpected issues
        }
    };

    return {
        form,
        setForm, // Providing setForm if direct state manipulation is needed elsewhere
        handleFormChange,
        addQuestion,
        handleQuestionChange,
        handleOptionChange,
        addOption,
        deleteQuestion,
        deleteOption,
        handleSubmit,
    };
};
